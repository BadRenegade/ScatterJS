function classof(obj) {
	if (obj == null) 
		return "Null";
	if (obj == undefined) 
		return "Undefined";
	return Object.prototype.toString.call(obj).splice(8, -1);
}