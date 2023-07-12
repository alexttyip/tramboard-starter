import { config } from '../config'

const tramStops = [
  "St Peter''s Square",
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

type TFGMResponse = Record<string, string>

const liveDepartures: { destination: string; time: string }[] = []
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
    return (await response.json()) as TFGMRawResponse
  } catch (error) {
    console.error(error)
  }
}

const tFGMResponseFromRawData = (rawResponse: TFGMRawResponse) => {
  for (const stationBoard of rawResponse.value) {
    extractDepartureFromApiObject({ jsonObject: stationBoard })
  }
}


liveDepartures.sort((a, b) => (Number(a.time) < Number(b.time) ? -1 : 1))
setDepartures(liveDepartures)
return json

function extractDepartureFromApiObject({
  jsonObject,
}: {
  jsonObject: TFGMResponse
}) {
  for (let i = 0; i < 4; i++) {
    const departureTime:{destination: string, time: string}  = getDepartureTimeEntry(jsonObject, i)
    if (departureIsUnique(departureTime)) {
      liveDepartures.push(departureTime)

    }
  }
}

function departureIsUnique(departureTime: {
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



// function rawResponseToDepartureTime(tfGMEntry: TFGMResponse) {
//   const waitTime = 'Wait' + String(i)
//   const destStation = 'Dest' + String(i)
//   if (tfGMEntry[waitTime]) {
//     const destinationTime = {
//       destination: tfGMEntry[destStation],
//       time: tfGMEntry[waitTime],
//     }
// }

function getDepartureTimeEntry(jsonObject: TFGMResponse, i: number) {
  const waitTime = 'Wait' + String(i)
  const destStation = 'Dest' + String(i)
  if (jsonObject[waitTime]) {
    const destinationTime: { destination: string; time: string } = {
      destination: jsonObject[destStation],
      time: jsonObject[waitTime],
    }
    return destinationTime
    const departureString = String(
      String(jsonObject[destStation] + jsonObject[waitTime])
    )
    if (!uniqueCheck.includes(departureString)) {
      liveDepartures.push(destinationTime)
      uniqueCheck.push(departureString)
    }
  }
}

export default function departureDataOfStop(station: string) {
  const rawData = fetchDataFromTFGMApi(station)
  const tFGMResponseList = tFGMResponseFromRawData(rawData)
}
