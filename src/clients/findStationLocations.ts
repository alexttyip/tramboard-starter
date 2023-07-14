import { convertAtcoToStationName } from './departuresFromStation'

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

const calculateDistance = (
  targetLat: number,
  targetLng: number,
  userLat: number,
  userLng: number
): number => {
  return (targetLat - userLat) ** 2 + (targetLng - userLng) ** 2
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
      Number(stationEntry[30]),
      Number(stationEntry[29]),
      userLatitude,
      userLongitude
    )
    if (calculatedDistance < minDistance) {
      minDistance = calculatedDistance
      minEntry = stationEntry
    }
  }
  return await convertAtcoToStationName('94' + minEntry[0].slice(2))
}
