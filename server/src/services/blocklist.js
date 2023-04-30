const fs = require('fs'),
  axios = require('axios')

const BLOCKLIST_FNAME = 'dnsmasq.blacklist.txt' 
  BLOCKLIST_URL = 'https://raw.githubusercontent.com/notracking/hosts-blocklists/master/dnsmasq/dnsmasq.blacklist.txt',
  BLOCKLIST_FFNAME = './data/' + BLOCKLIST_FNAME
  BLOCKLIST_EXPIRYSEC = 3600

module.exports = {
  name: 'blocklist',
  actions: {
    async getFiltered(ctx) {
      return await _getFiltered(ctx)
    },
    async getLatestCached(ctx) {
      if (!fs.existsSync(BLOCKLIST_FFNAME) || isExpired(BLOCKLIST_FFNAME, BLOCKLIST_EXPIRYSEC)) {
        await ctx.broker.call('blocklist.getLatest')
      }

      ctx.meta.$responseType = 'text/plain'
      return fs.readFileSync(BLOCKLIST_FFNAME,'utf-8')
    },
    async getLatest(ctx) {
      console.log(`Downloading: ${BLOCKLIST_URL}`)
      axios.get(BLOCKLIST_URL)
      .then((resp) => {
        fs.writeFileSync(BLOCKLIST_FFNAME, resp.data, 'utf-8')
      })
      .catch((err) => {
        console.error(err)
      })
    },
  }
}

async function _getFiltered(ctx) {
  console.log(`FilterDomain: ${ctx.params.FilterDomain}`)
  const ret = []

  const re = /address=\/(?<domain>.+?)\/(?<address>.*)/gm
  const lines = (await ctx.broker.call('blocklist.getLatestCached')).split('\n')
  while (lines.length) {
    const line = lines.pop()
    if (!line.startsWith('#')) {
      const matches = re.exec(line)
      if (matches && matches.groups.domain.endsWith(ctx.params.FilterDomain)) {
        // console.log(matches)
        // console.log(`0: ${matches[1]}`)
        console.log(`Domain: ${matches.groups.domain}`)
        ret.push(matches.groups.domain)
      }
    }
    // console.log(line)
  }

  return ret
}

function isExpired(fname, ExpirySec) {
  if (!fs.existsSync(fname)) {
    throw new Error(`Missing file: ${fname}`)
  }

  const stats = fs.statSync(fname)
  return ((new Date()).getTime() - stats.mtime.getTime()) > ExpirySec * 1000
}