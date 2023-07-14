import { convertAtcoToStationName } from './departuresFromStation'
import haversine from 'haversine-distance'

export const getAllStationData = async () => {
  try {
    const res = await fetch(
      'https://beta-naptan.dft.gov.uk/Download/MultipleLa',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          selectedLasNames: 'Greater Manchester / North West (180)',
          fileTypeSelect: 'csv',
        }).toString(),
      }
    )
    return await res.text()
  } catch (e) {
    console.log(e)
    return 'Server down!'
  }
}

const CSVToArray = (data: string, delimiter = ',', omitFirstRow = false) => {
  return data
    .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
    .split('\n')
    .map((v) => v.split(delimiter))
}

const asin = Math.asin
const cos = Math.cos
const sin = Math.sin
const sqrt = Math.sqrt
const PI = Math.PI

const R = 6378137

function toRad(x: number) {
  return (x * PI) / 180.0
}

function hav(x: number) {
  return sin(x / 2) ** 2
}

const calculateDistance = (
  target: { latitude: number; longitude: number },
  user: { latitude: number; longitude: number }
) => {
  const aLat = toRad(target.latitude)
  const bLat = toRad(user.latitude)
  const aLng = toRad(target.longitude)
  const bLng = toRad(user.longitude)

  const ht =
    hav(bLat - aLat) + Math.cos(aLat) * Math.cos(bLat) * hav(bLng - aLng)
  return 2 * R * Math.asin(Math.sqrt(ht))
}

export const filterStationData = async (
  userLatitude: number,
  userLongitude: number
) => {
  const stationData: string = await getAllStationData()
  let stationDataArray = CSVToArray(stationData)
  stationDataArray = stationDataArray.filter((stationData) => {
    return stationData[4]?.includes('Manchester Metrolink')
  })
  let minDistance = Infinity
  let minEntry = stationDataArray[0]
  for (const stationEntry of stationDataArray) {
    const calculatedDistance = calculateDistance(
      {
        latitude: Number(stationEntry[30]),
        longitude: Number(stationEntry[29]),
      },
      { latitude: userLatitude, longitude: userLongitude }
    )
    if (calculatedDistance < minDistance) {
      minDistance = calculatedDistance
      minEntry = stationEntry
    }
  }
  return await convertAtcoToStationName('94' + minEntry[0].slice(2))
}
