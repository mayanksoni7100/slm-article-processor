export const generateResponseObject = (code, msg, data='') => {
 if(data == ''){
  return {
    code,
    msg,
  }
 } else {
  return {
    code,
    msg,
    data
  }
 }
}

export const generateResponseObjectv2 = (responseCode, responseMessage, data='') => {
  if(data == ''){
   return {
     responseCode: responseCode.toString(),
     responseMessage,
   }
  } else {
   return {
     responseCode,
     responseMessage,
     data
   }
  }
}

export const generateCommonResponse = (code, msg) => {
   return {
     responseCode: code.toString(),
     responseMessage: msg
   }
 }

export const isUrl = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

return pattern.test(str);
}

export const isValidXmlElementName = (str)=> {
  var pattern = new RegExp('^(?!xml|Xml|xMl|xmL|XMl|xML|XmL|XML)[A-Za-z_][A-Za-z0-9-_.]*$','i');
  return pattern.test(str);
}

export const generateWoWResponseFormat = (header, detailedArray) => {
  return {
    DT_ESLResponse: {
      Header: header,
      DataArea:{
        DetailRecord: detailedArray
      }
    }
  }
}

export const generateValidationResponseObject = (code, msg, isValid) => {

   return {
     code,
     msg,
     isValid
   }
}


export const globalSearchConditions = [
  'EQUAL',
  'ANY WHERE',
  'STARTS WITH',
  'ENDS WITH'
]

export const gloablSortingOrders = [
  'asc',
  'desc'
]

export const getPaginationArray = (count, paginationCount) => {
  return new Promise(resolve => {
    let pages = 0;
    if ((count % paginationCount) > 0) {
      pages = parseInt(count / paginationCount) + 1;
    } else {
      pages = count / paginationCount;
    }
    let paginationArray = [];
    for (let page = 1; page <= pages; page++) {
      paginationArray.push({
        page,
        offset: ((page - 1) * paginationCount),
        limit: paginationCount
      });
    }
    resolve(paginationArray);
  });
}

export const getTwoDatesDifferenceInDays = (startDate, endDate) => {
  return new Promise(resolve => {
    // To calculate the time difference of two dates
    let Difference_In_Time = endDate.getTime() - startDate.getTime();
              
    // To calculate the no. of days between two dates
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    resolve(Difference_In_Days);
  });
}