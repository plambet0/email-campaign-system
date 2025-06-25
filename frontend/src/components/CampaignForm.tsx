import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Server, User, Lock, Globe, Hash, Eye, X } from 'lucide-react';
import { CreateCampaignRequest, SmtpConfig } from '../types';
import { campaignAPI } from '../services/api';
import toast from 'react-hot-toast';

const CampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: '',
    emails: [],
    htmlTemplate: '',
    smtpConfig: {
      host: 'smtp.gmail.com',
      port: 587,
      user: '',
      pass: '',
    },
  });

  const [emailsText, setEmailsText] = useState('');

  const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Our Newsletter</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            overflow: hidden; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: bold; 
        }
        .content { 
            padding: 30px 20px; 
        }
        .content h2 { 
            color: #333; 
            font-size: 20px; 
            margin-bottom: 15px; 
        }
        .content p { 
            margin-bottom: 15px; 
            font-size: 14px; 
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            font-weight: bold; 
            margin: 20px 0; 
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
            border-top: 1px solid #eee; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hello {{email}}!</h1>
            <p>Thank you for being our valued customer</p>
        </div>
        
        <div class="content">
            <h2>We have exciting news for you!</h2>
            
            <p>We want to share our latest offers and updates with you.</p>
            
            <p>Don't miss out on our special promotions and new features designed just for you.</p>
            
            <a href="#" class="button">View Our Latest Offers</a>
            
            <p>If you have any questions, don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            The [Your Company] Team</p>
        </div>
        
        <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  // Load campaign data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadCampaign(id);
    }
  }, [isEditing, id]);

  const loadCampaign = async (campaignId: string) => {
    try {
      const campaign = await campaignAPI.getCampaign(campaignId);
      setFormData({
        name: campaign.name,
        emails: campaign.emails,
        htmlTemplate: campaign.htmlTemplate,
        smtpConfig: campaign.smtpConfig,
      });
      setEmailsText(campaign.emails.join('\n'));
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Грешка при зареждане на кампанията');
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('smtp.')) {
      const smtpField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        smtpConfig: {
          ...prev.smtpConfig,
          [smtpField]: smtpField === 'port' ? parseInt(value) || 587 : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEmailsText(value);
    
    // Parse emails from textarea
    const emails = value
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    setFormData(prev => ({
      ...prev,
      emails,
    }));
  };

  const loadDefaultTemplate = () => {
    setFormData(prev => ({
      ...prev,
      htmlTemplate: defaultTemplate,
    }));
    toast.success('Зареден е примерен шаблон');
  };

  const getPreviewHtml = () => {
    if (!formData.htmlTemplate.trim()) {
      return '<p style="text-align: center; color: #666; font-family: Arial;">No template content to preview</p>';
    }

    // Replace placeholders for preview
    let previewHtml = formData.htmlTemplate;
    const sampleEmail = formData.emails.length > 0 ? formData.emails[0] : 'example@domain.com';
    
    previewHtml = previewHtml.replace(/\{\{email\}\}/g, sampleEmail);
    previewHtml = previewHtml.replace(/\{\{unsubscribe_url\}\}/g, '#unsubscribe');
    
    // Add GDPR footer preview
    if (!previewHtml.includes('unsubscribe') && !previewHtml.includes('отписване')) {
      const gdprFooter = `
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
          <p><strong>Why are you receiving this email?</strong></p>
          <p>You are receiving this email because you have been a customer of our company or have signed up for our services.</p>
          <p>If you do not wish to receive any more emails from us, you can <a href="#unsubscribe" style="color: #007bff;">unsubscribe here</a>.</p>
          <p><small>According to GDPR, you have the right to access, correct and delete your personal data.</small></p>
        </div>
      `;
      
      if (previewHtml.includes('</body>')) {
        previewHtml = previewHtml.replace('</body>', `${gdprFooter}</body>`);
      } else {
        previewHtml += gdprFooter;
      }
    }
    
    return previewHtml;
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Моля въведете име на кампанията');
      return false;
    }

    if (formData.emails.length === 0) {
      toast.error('Моля въведете поне един имейл адрес');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = formData.emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast.error(`Невалидни имейл адреси: ${invalidEmails.join(', ')}`);
      return false;
    }

    if (!formData.htmlTemplate.trim()) {
      toast.error('Моля въведете HTML шаблон');
      return false;
    }

    if (!formData.smtpConfig.host.trim()) {
      toast.error('Моля въведете SMTP хост');
      return false;
    }

    if (!formData.smtpConfig.user.trim()) {
      toast.error('Моля въведете SMTP потребител');
      return false;
    }

    if (!formData.smtpConfig.pass.trim()) {
      toast.error('Моля въведете SMTP парола');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        await campaignAPI.updateCampaign(id, formData);
        toast.success('Кампанията беше обновена успешно');
      } else {
        await campaignAPI.createCampaign(formData);
        toast.success('Кампанията беше създадена успешно');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.error(error.response?.data?.message || `Грешка при ${isEditing ? 'обновяване' : 'създаване'} на кампанията`);
    } finally {
      setLoading(false);
    }
  };

  const uniqueEmailsCount = new Set(formData.emails).size;
  const duplicatesCount = formData.emails.length - uniqueEmailsCount;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Редактиране на кампания' : 'Нова кампания'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Редактирайте съществуваща кампания' : 'Създайте нова имейл кампания за маркетинг'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campaign Details */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Детайли на кампанията
              </h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Име на кампанията *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Например: Промоция март 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="emails" className="form-label">
                  Имейл адреси * 
                  {formData.emails.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({uniqueEmailsCount} уникални{duplicatesCount > 0 && `, ${duplicatesCount} дублирани`})
                    </span>
                  )}
                </label>
                <textarea
                  id="emails"
                  value={emailsText}
                  onChange={handleEmailsChange}
                  className="form-textarea"
                  rows={4}
                  placeholder="example1@domain.com&#10;example2@domain.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Въведете по един имейл на ред или разделете с запетая.
                </p>
              </div>
            </div>

            {/* HTML Template */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  HTML шаблон
                </h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn btn-secondary text-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showPreview ? 'Скрий Preview' : 'Покажи Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={loadDefaultTemplate}
                    className="btn btn-secondary text-sm"
                  >
                    Зареди примерен шаблон
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="htmlTemplate" className="form-label">
                  HTML код на имейла *
                </label>
                <textarea
                  id="htmlTemplate"
                  name="htmlTemplate"
                  value={formData.htmlTemplate}
                  onChange={handleInputChange}
                  className="form-textarea font-mono text-sm"
                  rows={16}
                  placeholder="Въведете HTML кода на вашия имейл..."
                  required
                />
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  <p><strong>Placeholder-и:</strong></p>
                  <p>• <code>{'{{email}}'}</code> - ще бъде заменен с имейла на получателя</p>
                  <p>• <code>{'{{unsubscribe_url}}'}</code> - ще бъде заменен с линк за отписване</p>
                  <p><strong>GDPR:</strong> Ако не добавите линк за отписване, той ще бъде добавен автоматично.</p>
                </div>
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                SMTP настройки
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="smtp.host" className="form-label">SMTP хост *</label>
                  <input
                    type="text"
                    id="smtp.host"
                    name="smtp.host"
                    value={formData.smtpConfig.host}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="smtp.port" className="form-label">Порт *</label>
                  <input
                    type="number"
                    id="smtp.port"
                    name="smtp.port"
                    value={formData.smtpConfig.port}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="587"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="smtp.user" className="form-label">Потребителско име *</label>
                  <input
                    type="email"
                    id="smtp.user"
                    name="smtp.user"
                    value={formData.smtpConfig.user}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="your-email@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="smtp.pass" className="form-label">Парола *</label>
                  <input
                    type="password"
                    id="smtp.pass"
                    name="smtp.pass"
                    value={formData.smtpConfig.pass}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="app-password"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Съвети за SMTP настройки:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Gmail:</strong> Използвайте App Password вместо обикновената ви парола</li>
                  <li>• <strong>Outlook:</strong> smtp-mail.outlook.com, порт 587</li>
                  <li>• <strong>Yahoo:</strong> smtp.mail.yahoo.com, порт 587</li>
                </ul>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Отказ
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Обновява...' : 'Създава...'}
                  </>
                ) : (
                  isEditing ? 'Обнови кампанията' : 'Създай кампания'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Email Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b text-sm text-gray-600">
                  Preview - Test Email ({formData.emails.length > 0 ? formData.emails[0] : 'example@domain.com'})
                </div>
                <div 
                  className="p-4 max-h-96 overflow-auto bg-white"
                  dangerouslySetInnerHTML={{ 
                    __html: getPreviewHtml() 
                  }}
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>• Placeholders са заменени с примерни стойности</p>
                <p>• GDPR footer се добавя автоматично</p>
                <p>• Tracking pixel не се показва в preview</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignForm;