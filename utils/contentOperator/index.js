const segmentOperator = (segment, wordNum) => {
    let splitRes = [];
    if (segment.length < (wordNum - 2)) {
        splitRes.push(segment);
    } else {
        splitRes.push(segment.substring(0, wordNum - 2));
        segment = segment.substring(wordNum - 2);
        if (segment.length < wordNum) {
            splitRes.push(segment);
        } else {
            const reg = new RegExp(`.{${wordNum}}`, 'g');
            const segmentArr = segment.match(reg);
            segmentArr.push(segment.substring(segmentArr.join('').length));
            splitRes = splitRes.concat(segmentArr);
        }
    }
    return splitRes;
};

const pageOperator = (content, rowNum) => {
    const len = content.length;

    let index = 0; //用来表示切割元素的范围start
    let resIndex = 0; //用来递增表示输出数组的下标

    //根据length和size算出输出数组的长度，并且创建它。
    let result = new Array(Math.ceil(len / rowNum));
    //进行循环
    while (index < len) {
        //循环过程中设置result[0]和result[1]的值。该值根据array.slice切割得到。
        result[resIndex++] = content.slice(index, (index += rowNum));
    }
    //输出新数组
    return result;
};

export {
    segmentOperator,
    pageOperator
};
