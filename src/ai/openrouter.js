import https from 'node:https';
import env from '../config/env.js';
import DEFAULT_COMPANY from '../util/prompt.js';

function requestOpenRouter(messages) {
  return new Promise(function (resolve, reject) {
    if (!env.openrouterApiKey || !env.openrouterModel) {
      return reject(new Error('OPENROUTER_API_KEY e OPENROUTER_MODEL precisam estar configurados.'));
    }

    const body = JSON.stringify({
      model: env.openrouterModel,
      messages: messages,
      reasoning: { exclude: true }
    });
    const request = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.openrouterApiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HTTP-Referer': env.openrouterSiteUrl,
        'X-Title': env.openrouterAppName
      }
    }, function (response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', function (chunk) { responseBody += chunk; });
      response.on('end', function () {
        let parsed;
        try {
          parsed = JSON.parse(responseBody);
        } catch (error) {
          return reject(new Error('Resposta inválida do OpenRouter.'));
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          if (response.statusCode === 401 || response.statusCode === 403 || parsed.error?.message === 'User not found') {
            return reject(new Error('Chave do OpenRouter inválida ou sem autorização.'));
          }
          return reject(new Error(parsed.error?.message || 'OpenRouter retornou HTTP ' + response.statusCode + '.'));
        }
        if (!parsed.choices?.[0]?.message) {
          return reject(new Error('OpenRouter não retornou uma resposta de texto.'));
        }
        const reply = normalizeReply(parsed.choices[0].message.content);
        if (!reply) {
          return reject(new Error('OpenRouter retornou uma resposta vazia.'));
        }
        resolve(reply);
      });
    });
    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

function normalizeReply(content) {
  const text = Array.isArray(content)
    ? content.filter((part) => part.type === 'text').map((part) => part.text).join('')
    : String(content || '');

  const cleanedText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .split('\n')
    .filter((line) => !/^\s*User Safety:\s*safe\s*$/i.test(line))
    .join('\n')
    .replace(/[*_`#]/g, '')
    .trim();

  return cleanedText;
}

function generateReply(context) {
  const rules = DEFAULT_COMPANY.rules?.length ? '\nRegras:\n- ' + DEFAULT_COMPANY.rules.join('\n- ') : '';
  const systemPrompt = DEFAULT_COMPANY.prompt + '\nEmpresa: ' + DEFAULT_COMPANY.name + ' - ' + DEFAULT_COMPANY.description + rules;
  const customerMemory = context.memories.length ? context.memories.map(function (item) {
    return item.key + ': ' + item.value;
  }).join('\n') : 'Nenhuma memória cadastrada.';
  const history = context.history.length ? context.history.map(function (item) {
    return (item.role === 'assistant' ? 'Atendente' : 'Cliente') + ': ' + item.content;
  }).join('\n') : 'Nenhum histórico anterior.';

  return requestOpenRouter([
    { role: 'system', content: systemPrompt + '\n\nRetorne somente a resposta final destinada ao cliente. Não mostre análises internas, classificações de segurança, reasoning, rótulos ou metadados.' },
    { role: 'user', content: 'Contexto do cliente:\n' + JSON.stringify(context.context) + '\n\nMemória do cliente (' + (context.customer.name || 'sem nome') + '):\n' + customerMemory + '\n\nHistórico da conversa:\n' + history + '\n\nNova mensagem do cliente:\n' + context.incomingMessage }
  ]);
}

export { generateReply, normalizeReply };
