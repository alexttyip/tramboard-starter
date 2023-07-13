import { config } from '../config'

const tramStops = [
  "St Peter''s Square",
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

type TFGMResponse = Record<string, string>

let liveDepartures: { destination: string; time: string }[] = []
const uniqueCheck: string[] = []
interface TFGMRawResponse {
  value: TFGMResponse[]
}

const fetchDataFromTFGMApi = async (station: string) => {
  try {
    const response: Response = await fetch(
      `https://api.tfgm.com/odata/Metrolinks?$filter=StationLocation eq '${station}'`,
      {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': config.apiKey,
        },
      }
    )
    return (await response.json())
  } catch (error) {
    console.error(error)
  }
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
    const departureTime:{destination: string, time: string} | undefined = createDepartureObject(jsonObject, i)
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



function createDepartureObject(jsonObject: TFGMResponse, i: number) : { destination: string; time: string } | undefined {
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
  const rawData = await fetchDataFromTFGMApi(station) as TFGMRawResponse
  tFGMResponseFromRawData(rawData)
  liveDepartures.sort((a, b) => (Number(a.time) - Number(b.time)))
  return liveDepartures
}


