import {atcoToStationCode} from './departuresFromStation'
import jsonStops from '../resources/180Stops.json'


let atcoCodeDic = {}

export default async function main() {
  let atcoToStationCodeDic = await atcoToStationCode()
  for (let atcoEntry of jsonStops) {
    if (atcoToStationCodeDic.includes(atcoEntry.ATCOCode)) {
      console.log(atcoEntry.LocalityName + '$$$$$$$$$$$$$$')
    }
  }
  // console.log(atcoToStationCodeDic)
}
// let data = require('C:\Users\lyrfar\Documents\Training\tramboard-starter\src\resources\180Stops.csv')
// console.log(data)
// const fs = require('fs')
// fs.readFile('C:\\Users\\lyrfar\\Documents\\Training\\tramboard-starter\\src\\resources\\180Stops.csv', (err, inputD) => {
//   if (err) throw err;
//   console.log(inputD.toString());
// })
// let array = data.split("\n").map(function (line) {
//   return line.split(",");
// });
// console.log(array)
// export default async () => {
//   let stationATCOCodeDict = await stationCodeToATCO()
//   console.log(CSVT)
// }