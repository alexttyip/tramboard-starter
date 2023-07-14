import { Station } from '../screens/home'
export async function getStopData(filter: string) {
  const query = 'https://api.tfgm.com/odata/Metrolinks' + filter
  return fetch(query, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': 'b2f7a4b706de42af87d751cc83f4cdae',
    },
  }).then(async (response): Promise<Station> => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return await responseToJSON(response).then((responseJSON: Station) => {
      // console.log(responseJSON)
      return responseJSON
    })
  })
}

async function responseToJSON(response: Response) {
  return response.json()
}
