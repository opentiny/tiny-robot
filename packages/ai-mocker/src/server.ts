import express from 'express';
import cors from 'cors';
import { generateMockResponse } from './mockTemplates';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 延迟
const delay = (delayTime: number): Promise<null> => new Promise(resolve => setTimeout(resolve, delayTime));

// 随机延迟
const delayRandom = (start: number, end: number): Promise<null> => delay(Math.floor(Math.random() * (end - start)) + start)

// AI API接口模拟
app.post('/v1/chat/completions', async (req, res) => {
  const { messages, stream, model } = req.body;
  const response = generateMockResponse(messages);

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await delayRandom(500, 1500); // 延迟0.5-1.5秒

    const chunks = response.split('');
    let index = 0;

    const streamInterval = setInterval(() => {
      if (index >= chunks.length) {
        res.write('data: [DONE]\n\n');
        clearInterval(streamInterval);
        res.end();
        return;
      }

      const chunk = chunks[index];
      const data = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model || 'gpt-3.5-turbo',
        choices: [{
          index: 0,
          delta: {
            content: chunk
          },
          finish_reason: null
        }]
      };

      res.write(`data: ${JSON.stringify(data)}\n\n`);
      index++;
    }, 100);
  } else {
    await delayRandom(1000, 3000); // 延迟1-3秒

    res.json({
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'gpt-3.5-turbo',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Mock AI server is running at http://localhost:${port}`);
});