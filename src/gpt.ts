import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import readline from "readline";
import { logger } from "./utils/utils.js";
import { setting } from "./setting.js";
import HttpsProxyAgent from 'https-proxy-agent';

export class GPT {
    private openai: OpenAIApi;
    private apiKeys: Array<string> = [];
    private apiKeyIndex: number = 0;

    async init(): Promise<boolean> {
        if (!fs.existsSync('config')) {
            fs.mkdirSync('config');
        }
        if (!fs.existsSync('config/api_keys.txt')) {
            fs.writeFileSync('config/api_keys.txt', '');
        }
        // 一行一个key，忽略空行和空格
        const lineReader = readline.createInterface({
            input: fs.createReadStream('config/api_keys.txt')
        });
        lineReader.on('line', (line) => {
            if (line.trim() !== '') {
                this.apiKeys.push(line.trim());
            }
        });
        await new Promise<void>(resolve => lineReader.on('close', () => resolve()));
        if (this.apiKeys.length === 0) {
            logger('gpt').error('没有发现API Key，请在config/api_keys.txt中添加');
            return false;
        }
        logger('usage').info(`当前使用的API Key为${this.apiKeys[this.apiKeyIndex]}`);
        this.openai = new OpenAIApi(new Configuration({
            apiKey: this.apiKeys[this.apiKeyIndex],
            basePath: process.env.API_BASE_PATH,
        }));
        return true;
    }

    addKey(key: string) {
        this.apiKeys.push(key);
        fs.writeFileSync('config/api_keys.txt', this.apiKeys.join('\n'));
    }

    deleteKey(key: string) {
        this.apiKeys = this.apiKeys.filter(k => k !== key);
        fs.writeFileSync('config/api_keys.txt', this.apiKeys.join('\n'));
    }

    getKeys(): Array<string> {
        return this.apiKeys;
    }

    async chatCompletion(params) {
        while (this.apiKeyIndex < this.apiKeys.length) {
            try {
                const { data } = await this.openai.createChatCompletion(
                    {
                        model: "gpt-3.5-turbo",
                        max_tokens: setting.maxTokens,
                        ...params,
                    }, process.env.PROXY ? {
                        proxy: false,
                        httpAgent: HttpsProxyAgent(process.env.PROXY),
                        httpsAgent: HttpsProxyAgent(process.env.PROXY)
                    } : undefined
                );
                return ({
                    text: data.choices[0].message.content.trim(),
                    usage: data.usage
                });
            } catch (e) {
                logger('gpt').error(`apiKey(${this.apiKeys[this.apiKeyIndex]})请求失败，错误信息：${e.message}`);
                this.apiKeyIndex++;
                if (this.apiKeyIndex < this.apiKeys.length) {
                    logger('usage').info(`切换API Key为${this.apiKeys[this.apiKeyIndex]}`);
                }
                this.openai = new OpenAIApi(new Configuration({
                    apiKey: this.apiKeys[this.apiKeyIndex],
                    basePath: process.env.API_BASE_PATH,
                }));
            }
        }
        this.apiKeyIndex = 0;
        logger('gpt').error(`所有apiKey均请求失败`);
        return null;
    }
}