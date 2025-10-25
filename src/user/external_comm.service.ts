import { HttpModule, HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  async getInitialAuthFromExternal(): Promise<{ access: string; refresh: string }> {

    let configService:ConfigService = new ConfigService();
    let api_url = configService.get('AUTH_SERVICE_URL') as string;

    try {
        const response$ = this.httpService.get(api_url);
        const response = await firstValueFrom(response$);

        return response.data;
    }
    catch(err) {
        if (err instanceof NotFoundException) {
            throw err
        }
        else {
            throw new InternalServerErrorException("Couldn't get tokens"); 
        }
    } 
  }

  //TODO: delete auth
  async refreshTokenToBlacklist(refresh_token:string): Promise<true> {



    return true;
  }
}
