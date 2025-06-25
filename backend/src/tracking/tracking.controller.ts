import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Request, Response } from 'express';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('pixel/:id')
  async trackPixel(
    @Param('id') trackingId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    await this.trackingService.trackOpen(trackingId, ipAddress, userAgent);

    const pixel = await this.trackingService.getTrackingPixel();
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    
    res.send(pixel);
  }
}