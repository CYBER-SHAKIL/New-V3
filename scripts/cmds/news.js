'use strict';
const axios = require('axios');

module.exports = {
  config: {
    name:     'news',
    aliases:  ['headline', 'headlines', 'breaking'],
    version:  '1.0',
    author:   'CYBER-SHAKIL',
    countDown: 10,
    role:     0,
    shortDescription: { en: 'Get latest world news headlines' },
    category: 'utility',
    guide: {
      en:
        '{pn}           — top world news\n' +
        '{pn} tech       — technology news\n' +
        '{pn} sports     — sports news\n' +
        '{pn} bd         — Bangladesh news (English)\n\n' +
        'Example: -news tech'
    }
  },

  onStart: async function ({ message, args }) {
    const cat = (args[0] || '').toLowerCase();

    const catMap = {
      tech:       'technology',
      technology: 'technology',
      sports:     'sports',
      sport:      'sports',
      bd:         'bangladesh',
      bangladesh: 'bangladesh',
    };

    const mapped = catMap[cat] || 'general';
    const query  = mapped === 'bangladesh' ? 'Bangladesh+news' : mapped;

    await message.reply('Fetching latest news...');

    try {
      const url = mapped === 'bangladesh'
        ? `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=5&apiKey=demo`
        : `https://newsapi.org/v2/top-headlines?category=${mapped}&language=en&pageSize=5&apiKey=demo`;

      let res;
      try {
        res = await axios.get(url, { timeout: 10000 });
      } catch {
        const rss = await axios.get('https://feeds.bbci.co.uk/news/rss.xml', { timeout: 10000 });
        const items = rss.data.match(/<title><!\[CDATA\[(.*?)\]\]>/g)?.slice(1, 6) || [];
        const titles = items.map((i, n) => `${n + 1}. ${i.replace(/<[^>]+>/g, '').replace(/CDATA\[|\]/g, '')}`);
        if (!titles.length) throw new Error('No articles');
        return message.reply(`Latest News (BBC)\n\n${titles.join('\n\n')}\n\nSource: BBC News`);
      }

      const articles = res.data?.articles || [];
      if (!articles.length) throw new Error('No articles');

      let msg = `Latest ${cat ? cat.toUpperCase() : 'World'} News\n\n`;
      articles.slice(0, 5).forEach((a, i) => {
        msg += `${i + 1}. ${a.title}\n`;
        if (a.description) msg += `   ${a.description.slice(0, 100)}...\n`;
        msg += '\n';
      });
      msg += `Source: NewsAPI`;

      return message.reply(msg.trim());
    } catch (err) {
      return message.reply(`Could not fetch news right now.\nError: ${err.message}\n\nTry: -news`);
    }
  }
};
