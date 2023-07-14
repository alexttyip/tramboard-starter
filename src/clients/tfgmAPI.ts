import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'

export type TfGMData = {
  AtcoCode: string
  StationLocation: string
  Dest0: string
  Wait0: string
  Status0: string
  Carriages0: string
  Dest1: string
  Wait1: string
  Status1: string
  Carriages1: string
  Dest2: string
  Wait2: string
  Status2: string
  Carriages2: string
}[]

type StopData = {
  stopName: string
  incomingTrams: IncomingTram[]
}

export type IncomingTram = {
  dest: string
  wait: string
  carriages: string
  status: string
}

export async function tfgmCall() {
  const res = await fetch(tfgmEndpoint, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': config.apiKey,
    },
  })
  return (await res.json()) as { value: TfGMData }
}

export function pidDataToStopData(pidData: TfGMData): StopData {
  console.log('Running pidDataToStopData')
  const stopData: StopData = {
    stopName: '',
    incomingTrams: [],
  }
  if (pidData.length === 0) {
    return stopData
  }

  stopData.stopName = pidData[0].StationLocation
  for (const platformData of pidData) {
    if (!(platformData.Dest0 === '')) {
      stopData.incomingTrams.push({
        dest: platformData.Dest0,
        wait: platformData.Wait0,
        status: platformData.Status0,
        carriages: platformData.Carriages0,
      })
    }
    if (!(platformData.Dest1 === '')) {
      stopData.incomingTrams.push({
        dest: platformData.Dest1,
        wait: platformData.Wait1,
        status: platformData.Status1,
        carriages: platformData.Carriages1,
      })
    }
    if (!(platformData.Dest2 === '')) {
      stopData.incomingTrams.push({
        dest: platformData.Dest2,
        wait: platformData.Wait2,
        status: platformData.Status2,
        carriages: platformData.Carriages2,
      })
    }
  }

  stopData.incomingTrams.sort((a, b) => {
    if (a.status === 'Departing') {
      return -1
    }
    if (b.status === 'Departing') {
      return 1
    }

    return parseInt(a.wait) - parseInt(b.wait)
  })

  return stopData
}

export async function getAllStops() {
  const stops: { label: string; value: string }[] = []
  const json = await tfgmCall()
  for (const item of json.value) {
    const truncAtcoCode = item.AtcoCode.substring(0, item.AtcoCode.length - 1)
    const newStop = { label: item.StationLocation, value: truncAtcoCode }

    if (
      !stops.some((value) => {
        return value.value === truncAtcoCode
      })
    ) {
      stops.push(newStop)
    }
  }

  return stops
}
