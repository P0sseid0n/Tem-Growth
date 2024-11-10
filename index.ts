import puppeteer from 'puppeteer'
import chalk from 'chalk'

async function temGrowth() {
	console.time('Time')
	const browser = await puppeteer.launch({
		headless: true,
		timeout: 40_000,
	})

	const urls: Array<{ title: string; url: string }> = [
		{
			title: 'Creatina Monohidratada 250g',
			url: 'https://www.gsuplementos.com.br/creatina-monohidratada-250gr-growth-supplements-p985931/?v=1',
		},
		{
			title: 'Creatina 250g - Creapure',
			url: 'https://www.gsuplementos.com.br/creatina-250g-creapure-growth-supplements-p985824/?v=1',
		},
		{
			title: 'Creatina Monohidratada 100g',
			url: 'https://www.gsuplementos.com.br/creatina-monohidratada-100gr-growth-supplements-p985930',
		},
		{
			title: 'Creatina 100g - Creapure',
			url: 'https://www.gsuplementos.com.br/creatina-100g-creapure-growth-supplements-p985927',
		},
		{
			title: 'Creatina Creapure 120 comprimidos',
			url: 'https://www.gsuplementos.com.br/creatina-creapure-120comp-growth-supplements',
		},
	]

	const pagePromises = urls.map(({ title, url }) => {
		return new Promise(async (resolve, reject) => {
			console.time(title)
			const page = await browser.newPage()

			await page.setRequestInterception(true)

			page.on('request', req => {
				if (req.resourceType() === 'image') {
					req.abort()
				} else {
					req.continue()
				}
			})

			await page.goto(url)

			await page.waitForSelector('.botao-de-compra')

			const isAvailable = await page.evaluate(() => {
				const botaoDeCompraContainer = document.querySelector('.botao-de-compra')
				const botaoDeCompra = botaoDeCompraContainer?.querySelector('.botaoComprar')
				const botaoIndisponivel = botaoDeCompraContainer?.querySelector('.indisponivel--button')

				return botaoDeCompra && !botaoIndisponivel
			})

			page.close()
			resolve(`${title}: ${isAvailable ? chalk.green('Disponível') : chalk.red('Indisponível')}`)
			console.timeEnd(title)
		})
	})

	const results = await Promise.all(pagePromises)

	results.forEach(result => console.log(result))

	console.timeEnd('Time')
	await browser.close()
}

temGrowth()

const ONE_MINUTE = 1000 * 60

setInterval(async () => await temGrowth(), ONE_MINUTE * 2)
