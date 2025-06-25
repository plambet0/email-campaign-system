import { Controller, Get, Post, Query, Body, Res } from '@nestjs/common';
import { UnsubscribeService } from './unsubscribe.service';
import { Response } from 'express';

@Controller('unsubscribe')
export class UnsubscribeController {
  constructor(private readonly unsubscribeService: UnsubscribeService) {}

  @Get()
  async unsubscribePage(
    @Query('email') email: string,
    @Query('campaign') campaignId: string,
    @Res() res: Response,
  ) {
    if (!email) {
      return res.status(400).send('Missing email parameter');
    }

    const unsubscribeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Отписване</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .container { text-align: center; }
          .success { color: #28a745; }
          .error { color: #dc3545; }
          button { background: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Отписване от имейл списък</h2>
          <p>Сигурни ли сте, че искате да се отпишете от нашия имейл списък?</p>
          <p><strong>Имейл:</strong> ${email}</p>
          
          <form method="POST" action="/api/unsubscribe/confirm" style="margin: 20px 0;">
            <input type="hidden" name="email" value="${email}">
            <input type="hidden" name="campaignId" value="${campaignId || ''}">
            <textarea name="reason" placeholder="Причина (по избор)" rows="3" cols="50" style="margin: 10px 0; display: block; margin: 10px auto;"></textarea>
            <button type="submit">Потвърди отписването</button>
          </form>
          
          <p><small>
            Съгласно GDPR, ще премахнем вашия имейл адрес от всички бъдещи комуникации.
            Тази операция е необратима.
          </small></p>
        </div>
      </body>
      </html>
    `;

    res.send(unsubscribeHtml);
  }

  @Post('confirm')
  async confirmUnsubscribe(
    @Body() body: { email: string; campaignId?: string; reason?: string },
    @Res() res: Response,
  ) {
    try {
      await this.unsubscribeService.unsubscribeEmail(
        body.email,
        body.campaignId,
        body.reason,
      );

      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Успешно отписване</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <div class="success">
            <h2>✓ Успешно отписване</h2>
            <p>Вашият имейл адрес беше премахнат от нашия списък.</p>
            <p>Няма да получавате повече имейли от нас.</p>
          </div>
        </body>
        </html>
      `;

      res.send(successHtml);
    } catch (error) {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Грешка</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Грешка при отписване</h2>
            <p>${error.message}</p>
          </div>
        </body>
        </html>
      `;

      res.status(400).send(errorHtml);
    }
  }
}