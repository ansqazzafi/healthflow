import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    async Greet() {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HealthFlow</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            color: #333;
            padding: 40px;
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            animation: fadeIn 2s forwards;
          }

          h1 {
            color: #3498db;
            font-size: 3rem;
            animation: slideIn 1.5s ease-in-out;
          }

          .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            text-align: center;
            opacity: 0;
            animation: fadeInContainer 2s forwards 0.5s;
          }

          footer {
            text-align: center;
            margin-top: 30px;
            color: #777;
          }

          button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-top: 20px;
          }

          button:hover {
            background-color: #45a049;
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes slideIn {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(0);
            }
          }

          @keyframes fadeInContainer {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to HealthFlow</h1>
          <p>Hello, Welcome to HealthFlow! We are glad to have you here. Explore our services and make your health a priority.</p>
        </div>
      </body>
      </html>
    `;
    }

}
