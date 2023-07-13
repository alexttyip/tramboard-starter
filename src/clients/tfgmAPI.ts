import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'

type TfGMData = {
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

async function tfgmCall() {
  const res = await fetch(tfgmEndpoint, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': config.apiKey,
    },
  })
  return (await res.json()) as { value: TfGMData }
}
