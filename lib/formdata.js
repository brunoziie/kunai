const FormData = require('form-data');
const { ReadStream } = require('fs');

function buildFormData(formData, data, parentKey) {
	if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof ReadStream)) {
		Object.keys(data).forEach(key => {
			buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
		});
	} else {
		const value = data == null ? '' : data;
		formData.append(parentKey, value);
	}
}

module.exports.create = function (data) {
	const formData = new FormData();
	buildFormData(formData, data);
	return formData;
}