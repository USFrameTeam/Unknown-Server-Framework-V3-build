const Valid64Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnmopqrstuvwxyz=+";
//自带去重，无参数随机生成
export function IDGenerate(array = [], IDLength = 3){
	let id;
	do{
		id = "";
		for(let times = 0; times < IDLength;times++){
			id += Valid64Chars[Math.round(Math.random() * 63)];
		};
	} while(array.includes(id));
	return id;
};

export function Dichotomy(list, number, method = (element)=>{
	return element;
}){
	let index = Math.round(list.length / 2);
	let maxIndex = list.length - 1;
	let minIndex = 0;
	while(maxIndex > minIndex){
		if(method(list[index]) < number){
			minIndex = index + 1;
		} else if(method(list[index]) > number){
			maxIndex = index;
		};
		index = (maxIndex + minIndex) / 2;
		if((minIndex < 0) || (maxIndex > list.length)){
			return -1;
		};
	}
	return index;
};

export class Vector {
	//向量相加
  static add(vector1, vector2) {
    return {
      x: vector1.x + vector2.x,
      y: vector1.y + vector2.y,
      z: vector1.z + vector2.z
    };
  };
  //获取距一点距离为theDistance，角度xz处的坐标
  static faceLocation(theVector, theDistance, theRotation) {
    let faceVector_y = (theVector.y - Math.sin(theRotation.x * Math.PI / 180) * theDistance);
    let faceVector_r = (Math.cos(theRotation.x * Math.PI / 180) * theDistance);
    let faceVector_x = (theVector.x - faceVector_r * Math.sin(theRotation.y * Math.PI / 180));
    let faceVector_z = (theVector.z + faceVector_r * Math.cos(theRotation.y * Math.PI / 180));
    let finallyVector = {
      x: faceVector_x,
      y: faceVector_y,
      z: faceVector_z
    };
    return finallyVector;
  };
  //乘
  static mulNumber(vector, num) {
    return {
      x: vector.x * num,
      y: vector.y * num,
      z: vector.z * num
    };
  };
  static mulVector(vector1, vector2){
  	return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
  };
  //距离
  static distance(Vector1, Vector2) {
    let TheDistance = Math.sqrt(Math.pow((Vector1.x - Vector2.x), 2) + Math.pow((Vector1.y - Vector2.y), 2) + Math.pow((Vector1.z - Vector2.z), 2));
    return TheDistance;
  }
};

export class Log {
  static error(message) {
    console.error(message);
  }
  static log(message) {
    console.log(message);
  }
  static warn(message) {
    console.warn(message);
  }
};