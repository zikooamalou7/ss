

## To run bot:
1. Create .env file
2. Set TELEGRAM_TOKEN , TELEGRAM_CHANNEL , TELEGRAM_CHANNEL_WRONG and TELEGRAM_ADMIN_ID in it
3. Start bot:
  * With docker
    ```
    docker build -t 1xbet .
    docker run --name 1xbet -d 1xbet
    ```
  * Without docker
    ```
    npm install
    npm start
    ```
       OR
    ```
    yarn install
    yarn start
    ```

