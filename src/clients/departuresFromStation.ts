import { config } from '../config'

type TFGMResponse = Record<string, string>

let liveDepartures: { destination: string; time: string }[] = []
const uniqueCheck: string[] = []

interface TFGMRawResponse {
  value: TFGMResponse[]
}

const tFGMStationData = async (station: string) => {
  const link = `$filter=StationLocation eq '${station}'`
  return await fetchDataFromTFGMApi(link)
}

// const stationNames: string[] = []

const aTCCodeToStationName: { [index: string]: string } = {}

const aTCOCodeListFromTFGMApi = async () => {
  const link = ''
  const rawData = await fetchDataFromTFGMApi(link)
  if (!rawData) {
    return
  }
  for (const stationBoard of rawData.value) {
    const stationATCOCode: string = stationBoard.AtcoCode
    if (!Object.keys(aTCCodeToStationName).includes(stationATCOCode)) {
      aTCCodeToStationName[stationATCOCode] = stationBoard.StationLocation
    }
  }
  console.log(aTCCodeToStationName)
}

export const stationNameListFromTFGMApi = async () => {
  const stationNames: string[] = []
  const link = ''
  const rawData = await fetchDataFromTFGMApi(link)
  for (const stationBoard of rawData.value) {
    const stationName: string = stationBoard.StationLocation
    if (!stationNames.includes(stationName)) {
      stationNames.push(stationName)
    }
  }
  return stationNames
}

const fetchDataFromTFGMApi = async (link: string) => {
  console.log(`https://api.tfgm.com/odata/Metrolinks?${link}`)
  const response: Response = await fetch(
    `https://api.tfgm.com/odata/Metrolinks?${link}`,
    {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    }
  )
  return (await response.json()) as TFGMRawResponse
}

const tFGMResponseFromRawData = (rawResponse: TFGMRawResponse) => {
  for (const stationBoard of rawResponse.value) {
    extractDepartureFromApiObject({ jsonObject: stationBoard })
  }
}

function extractDepartureFromApiObject({
  jsonObject,
}: {
  jsonObject: TFGMResponse
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
  const departureString = String(
    String(departureTime.destination + departureTime.time)
  )
  if (!uniqueCheck.includes(departureString)) {
    uniqueCheck.push(departureString)
    return true
  }
  return false
}

function createDepartureObject(
  jsonObject: TFGMResponse,
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
  liveDepartures = []
  await stationNameListFromTFGMApi()
  const rawData = await tFGMStationData(station)
  tFGMResponseFromRawData(rawData)
  liveDepartures.sort((a, b) => Number(a.time) - Number(b.time))
  return liveDepartures
}
