var enrolled_data = []
var predicted_data = []

var image_list_data = []
var default_campaign = {
  list_image: "",
  enroll_image: "",
}

var current_working_set = ''

var predictionContainer = "#prediction_container"
var listConatainer = "#list_container"
var enrollContainer = "#enroll_container"

function getEnrolledDataUrl() {
  return used_host + '/enroll_data'
}

function getEnrolledData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getEnrolledDataUrl(),
    xhrFields: {
        // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        // This can be used to set the 'withCredentials' property.
        // Set the value to 'true' if you'd like to pass cookies to the server.
        // If this is enabled, your server must respond with the header
        // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false
    },
    success: function (json) {
        if (!json.status) {
          console.error('Serverside Error While Geting Enrolled Data');
          console.error(json.message)
        }
        else {
          enrolled_data = json.details
          initEnrolled()
        }
    },
    error: function (data) {
        console.log("Error While Getting Enrolled Data");
        console.log(data);
    }
  });
}

function initEnrolled() {
  var images = []
  $.each(enrolled_data, function (indx, data) {
    var enrol_dom = '<div class="col-sm-2">'
    enrol_dom+='<img class="img-fluid enroll_image" class="enroll_image" src="'+data+'" alt="Photo" id="enrol_'+indx+'" onClick="enrollImageClicked(\''+data+'\','+indx+')">'
    enrol_dom+='</div>'
    images.push(enrol_dom) 
  })
  $(enrollContainer).html(images)
  
}
function getPredictionDataUrl() {
  return used_host + '/prediction_data'
}
function getMappingUrl() {
  return used_host + '/mapper'
}

function getPredictionData(querry) {
  $.ajax({
    cache: false,
    type: 'GET',
    url: getPredictionDataUrl(),
    xhrFields: {
        // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        // This can be used to set the 'withCredentials' property.
        // Set the value to 'true' if you'd like to pass cookies to the server.
        // If this is enabled, your server must respond with the header
        // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false
    },
    success: function (json) {
        if (!json.status) {
          console.error('Serverside Error While Geting Prediction Data');
          console.error(json.message)
        }
        else {
          predicted_data = json.details
          initPrediction(predicted_data[current_page-1])
          if(current_page >= predicted_data.length) {$('#previousButton').show();  $('#nextButton').hide()}
          if(current_page <= 1) {$('#previousButton').hide(); $('#nextButton').show()}
          else { $('#previousButton').show(); $('#nextButton').show() }
        }
    },
    error: function (data) {
        console.log("Error While Getting Prediction Data");
        console.log(data);
    }
  });
}

function postMapingData(data) {
  $.ajax({
    cache: false,
    type: 'POST',
    url: getMappingUrl(),
    dataType: 'json',
    data: data,
    xhrFields: {
        // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        // This can be used to set the 'withCredentials' property.
        // Set the value to 'true' if you'd like to pass cookies to the server.
        // If this is enabled, your server must respond with the header
        // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false
    },
    success: function (json) {
        if (!json.status) {
          notifyUser('danger', 'Server Error Mapping Image')
          console.error('Serverside Error While Posting Image Map');
          console.error(json.message)
        }
        else {
          notifyUser('success', 'Map Saved Successfully')
          getPredictionData()
          // predicted_data = json.details
          // initPrediction(predicted_data[0])
        }
    },
    error: function (data) {
        console.log("Error While Posting Image Map");
        console.log(data);
    }
  });
}

function initPrediction(pdata) {
  var prediction_list_dom = []
  var prediction_image_dom = '<a href="'+pdata.image_path+'" data-toggle="lightbox" data-title="Image Used for Prediction" data-gallery="gallery">'
  prediction_image_dom += '<img class="img-fluid" src="'+pdata.image_path+'" alt="Photo"></img>'
  prediction_image_dom += '<a/>'
  $(predictionContainer).html(prediction_image_dom)
  $.each(pdata.recognised_images, function (indx,image_data) {
    var done = image_data.mapped_image!='TBD'?'done':''
    prediction_list_dom.push('<img class="img-fluid list_image '+done+'" src="'+image_data.recognised_image+'" id="list_'+indx+'" alt="Photo" onClick="imageListClicked(\''+image_data.mapped_image+'\','+indx+')" ></img>')
  })
  $(listConatainer).html(prediction_list_dom)
}
function enrollImageClicked(data, indx) {
  $(enrollContainer+'>div>img').removeClass('active')
  $('#enrol_'+indx).hasClass('active')?$('#enrol_'+indx).removeClass('active'):$('#enrol_'+indx).addClass('active')
}
function imageListClicked(data, indx) {
  $(listConatainer+'>img').removeClass('active')
  $('#list_'+indx).hasClass('active')?$('#list_'+indx).removeClass('active'):$('#list_'+indx).addClass('active')
  $(enrollContainer+'>div>img').removeClass('active')
  if($(enrollContainer+'>div>img[src$="'+data+'"]').length>0) {
    $(enrollContainer+'>div>img[src$="'+data+'"]').addClass('active')
    $('html, body').animate({
        scrollTop: $(enrollContainer+'>div>img[src$="'+data+'"]').offset().top
    }, 100);
  }
 
}
function mapImageClicked() {
  var enroll_image = ''
  var list_image = ''
  if($(enrollContainer+'>div>img.active').length==1){
    enroll_image = $(enrollContainer+'>div>img.active').attr('src')
  }
  if($(listConatainer+'>img.active').length==1){
    list_image = $(listConatainer+'>img.active').attr('src')
  }
  if(!list_image) {
    notifyUser('error','Please Select Predicted Image!')
  }
  else if(!enroll_image) {
    notifyUser('error','Please Select Enrolled Image!')
  } else {
    var data = {
      image_path: $(predictionContainer+'>a>img').attr('src'),
      recognised_image: list_image.toString(),
      mapped_image: enroll_image.toString()
    }
    postMapingData(data)
  }
}
var current_page = 1;
function predictionImageNextClicked() {
  if(current_page == predicted_data.length) {
    notifyUser('error', 'Already Showing Last Entry!')
  } else {
    current_page++;
    $('#previousButton').show()
    if(current_page == predicted_data.length) $('#nextButton').hide()
    else $('#nextButton').show()
    initPrediction(predicted_data[current_page-1])
  }
}
function predictionImagePreviousClicked() {
  if(current_page == 1) {
    notifyUser('error', 'Already Showing First Entry!')
  } else {
    current_page--;
    $('#nextButton').show()
    if(current_page == 1) $('#previousButton').hide()
    else $('#previousButton').show()
    initPrediction(predicted_data[current_page-1])
  }
  
}
function refresh() {
  getEnrolledData()
  getPredictionData()
  current_page = 1;
}

refresh()