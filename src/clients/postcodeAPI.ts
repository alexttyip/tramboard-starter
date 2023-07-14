import { Coordinates } from '../screens/nearest'

const postcodeEndpoint = 'https://api.postcodes.io/postcodes/'

type PostcodeReturn = {
  status: string
  result: Coordinates
}

export async function postcodeCall(
  postcode: string
): Promise<Coordinates | number> {
  const res = await fetch(postcodeEndpoint + postcode, {
    method: 'GET',
  })
  if (res.status !== 200) {
    return res.status
  }
  return ((await res.json()) as PostcodeReturn).result
}
