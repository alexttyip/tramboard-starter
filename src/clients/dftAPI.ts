import { config } from '../config'

const dftEndpoint = 'https://beta-naptan.dft.gov.uk/Download/MultipleLa'

type DfTData = {
  atcoCode: string
  longitude: string
  latitude: string
}

export async function dftCallToJSON() {
  const res = await fetch(dftEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      selectedLasNames: 'Greater Manchester / North West (180)',
      fileTypeSelect: 'csv',
    }).toString(),
  })
  return csvToJson(await res.text())
}

function csvToJson(csvData: string): DfTData[] {
  console.log('Running csvToJson')
  const json: DfTData[] = []
  const lines = csvData.split('\n')

  const headers = lines[0].split(',')
  const longitudeIndex = headers.findIndex((s) => s === 'Longitude')
  const latitudeIndex = headers.findIndex((s) => s === 'Latitude')
  const atcoCodeIndex = headers.findIndex((s) => s === 'ATCOCode')

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (!values[atcoCodeIndex].includes('1800ZZ', 0)) {
      continue
    }

    json.push({
      longitude: values[longitudeIndex],
      latitude: values[latitudeIndex],
      atcoCode: values[atcoCodeIndex],
    })
  }
  return json
}
