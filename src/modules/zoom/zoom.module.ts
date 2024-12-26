import { Module } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Module({
    imports:[],
    providers:[ZoomService],
    exports:[ZoomService]
})
export class ZoomModule {}
