function metrics(version, data) {
  var metrics = data.metrics;
  var wwwroot = data.root;
  var type = data.type;
  var image = 'default-point-metric';
  if(type === 'badge') {
    image = 'default-set-metric';
  }
  html = '<table id="pl_'+type+'_table" class="generaltable"><thead><tr>';
  html += '<th class="header c1 lastcol centeralign" style="" scope="col">Image</th>';
  html += '<th class="header c1 lastcol centeralign" style="" scope="col">Name</th>';
  html += '</tr></thead><tbody>';
  for(var i=0;i<metrics.length;i++) {
    var metric = metrics[i];
    html += '<tr><td>'+create_image(wwwroot, image)+'</td><td style="vertical-align: middle;">' + metric.name + '</td></tr>';
  }
  html += '</tbody>';
  html += '</table>';
  html += '<input id="pl_'+type+'_text" type="text" style="width: 200px;"></input><button id="add_'+type+'">Add '+type+'</button>';
  $('#gamification_'+type+'_block').html(html);
  $('#add_'+type+'').click(function(event) {
    var text =  $('#pl_'+type+'_text').val();
    $('#pl_'+type+'_text').val('');
    $.ajax({
      type: 'POST',
      url: wwwroot+'/blocks/playlyfe/api.php?plcontext='+type,
      dataType: 'json',
      contentType : 'application/json',
      data: JSON.stringify({ name: text })
    })
    .fail(function (err) {
      err = JSON.parse(err.responseText);
      alert(err.message);
    })
    .done(function () {
      $('#pl_'+type+'_table tbody').append('<tr><td>'+create_image(wwwroot, image)+'</td><td style="vertical-align: middle;">'+text+'</td></tr>');
    });
  });
}

function create_image(wwwroot, id) {
  return '<img src="' + wwwroot + '/blocks/playlyfe/api.php?image_id='+ id + '&size=small">';
}
