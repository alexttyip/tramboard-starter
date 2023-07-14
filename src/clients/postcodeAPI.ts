import { Coordinates } from '../screens/nearest'

const postcodeEndpoint = 'https://api.postcodes.io/postcodes/'

type PostcodeReturn = {
  status: string
  result: Coordinates
}

export async function postcodeCall(postcode: string) {
  const res = await fetch(postcodeEndpoint + postcode, {
    method: 'GET',
  })
  return ((await res.json()) as PostcodeReturn).result
}
