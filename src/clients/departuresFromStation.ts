import { config } from '../config'

type tfgmResponse = Record<string, string>

let liveDepartures: { destination: string; time: string }[] = []
const uniqueCheck: string[] = []

interface tfgmRawResponse {
  value: tfgmResponse[]
}

export const convertAtcoToStationName = async (atcoCode: string) => {
  const tfgmRawData = await fetchDataFromtfgmApi()
  for (const stationBoardEntry of tfgmRawData.value) {
    if (stationBoardEntry.AtcoCode === atcoCode) {
      return stationBoardEntry.StationLocation
    }
  }
}

const tfgmStationData = async (station: string) => {
  const link = `$filter=StationLocation eq '${station}'`
  return await fetchDataFromtfgmApi(link)
}

const stationATCOCodeDict: { [index: string]: string[] } = {}

export const atcoToStationCode = async () => {
  const stationATCOCodeDict: { [index: string]: string } = {}
  const link = ''
  const rawData = await fetchDataFromtfgmApi(link)
  // console.log(rawData.value)
  for (const stationBoard of rawData.value) {
    const stationAtco: string = stationBoard.AtcoCode
    if (!Object.keys(stationATCOCodeDict).includes(stationAtco)) {
      stationATCOCodeDict['18' + stationAtco.slice(2)] = [stationBoard.StationLocation]
    }
  }
  return stationATCOCodeDict
}

const findStationLocation = (station) => {
  let stationAtco = stationATCOCodeDict[station]
  console.log(stationAtco)
}

export const stationNameListFromtfgmApi = async () => {
  const stationNames: string[] = []
  const link = ''
  const rawData = await fetchDataFromtfgmApi(link)
  for (const stationBoard of rawData.value) {
    const stationName: string = stationBoard.StationLocation
    if (!stationNames.includes(stationName)) {
      stationNames.push(stationName)
    }
  }
  return stationNames
}

const fetchDataFromtfgmApi = async (link: string) => {
  const response: Response = await fetch(
    `https://api.tfgm.com/odata/Metrolinks?${link}`,
    {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    }
  )
  return (await response.json()) as tfgmRawResponse
}

const tfgmResponseFromRawData = (rawResponse: tfgmRawResponse) => {
  for (const stationBoard of rawResponse.value) {
    extractDepartureFromApiObject({ jsonObject: stationBoard })
  }
}

function extractDepartureFromApiObject({
  jsonObject,
}: {
  jsonObject: tfgmResponse
}) {
  for (let i = 0; i < 4; i++) {
    const departureTime: { destination: string; time: string } | undefined =
      createDepartureObject(jsonObject, i)
    if (typeof departureTime === 'undefined') {
      continue
    }
    if (isDepartureUnique(departureTime)) {
      liveDepartures.push(departureTime)
    }
  }
}

function isDepartureUnique(departureTime: {
  destination: string
  time: string
}) {
  const departureString =
    String(departureTime.destination + departureTime.time)
  if (!uniqueCheck.includes(departureString)) {
    uniqueCheck.push(departureString)
    return true
  }
  return false
}

function createDepartureObject(
  jsonObject: tfgmResponse,
  i: number
): { destination: string; time: string } | undefined {
  const waitTime = 'Wait' + String(i)
  const destStation = 'Dest' + String(i)
  if (jsonObject[waitTime]) {
    const destinationTime: { destination: string; time: string } = {
      destination: jsonObject[destStation],
      time: jsonObject[waitTime],
    }
    return destinationTime
  }
}

export default async function (station: string) {
  console.log(station, 'inside dep file')
  liveDepartures = []
  await stationNameListFromtfgmApi()
  const rawData = await tfgmStationData(station)
  tfgmResponseFromRawData(rawData)
  liveDepartures.sort((a, b) => Number(a.time) - Number(b.time))
  return liveDepartures
}
