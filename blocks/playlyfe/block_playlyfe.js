var root= "/";

function makeApi(method, route, body) {
  body =  body || {};
  return $.ajax({
    type: 'POST',
    url: root+'/blocks/playlyfe/api.php?method='+method+'&route='+route,
    dataType: 'json',
    contentType : 'application/json',
    data: JSON.stringify(body)
  })
  .fail(function (err) {
    console.log(err.responseText);
    err = JSON.parse(err.responseText);
    alert(err.message);
  });
}

// Creates a metric list in the block
function create_metric_list(version, data) {
  var metricList = new MetricList('gamification_'+data.type+'_block', data.type, data.root, data.metrics);
}

/*
  Creates a new MetricList Object
  @param id string the div on which this component will be mounted to
  @param type string what this block will display whether `point` or `badge'
  @param root string the root location of the webserver
  @param metrics array the list of metrics to prefill the block with
*/
function MetricList(id, type, wwwroot, metrics) {
  this.id = id;
  this.type = type;
  this.image = 'default-point-metric';
  if(type === 'badge') {
    this.image = 'default-set-metric';
  }
  root = wwwroot;
  this.$el = $('#'+id);
  this.render();
  for(var i=0;i<metrics.length;i++) {
    this.add(metrics[i]);
  }
  var self = this;
  this.addButton.click(function(event) {
    self.create();
  });
}

// Renders the metric list as table with all items and also creates an add button and text
MetricList.prototype.render = function() {
  html =
  '<table id="'+this.id+'_table" class="generaltable">' +
    '<thead>' +
      '<tr>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Image</th>' +
        '<th class="header c1 lastcol centeralign" style="" scope="col">Name</th>' +
      '</tr>'+
    '</thead>' +
  '<tbody>' +
  '</tbody>' +
  '</table>' +
  '<input id="'+this.id+'_text" type="text" style="width: 200px;"></input>' +
  '<button id="'+this.id+'_add">Add '+this.type+'</button>';
  this.$el.html(html);
  this.textInput = $('#'+this.id+'_text');
  this.addButton = $('#'+this.id+'_add');
}

// Create's a new metric by making an post request and then adds it to this list
MetricList.prototype.create = function(name) {
  var name = this.textInput.val();
  this.textInput.val('');
  var self = this;
  makeApi('POST', '/design/versions/latest/metrics', {
    id: name,
    name: name,
    type: 'point',
    'constraints': {
      'default': '0',
      'max': 'Infinity',
      'min': '0'
    },
    'tags': [this.type]
  })
  .done(function (data) {
    self.add(data);
  });
}

// This will add a metric to this list
MetricList.prototype.add = function(metric) {
  var self = this;
  this.$el.find('#'+this.id+'_table tbody').append(
    '<tr id="'+metric.id+'_row">' +
      '<td>' +
        '<img src="' + root + '/blocks/playlyfe/image.php?image_id='+ this.image + '&size=small">' +
      '</td>' +
      '<td style="vertical-align: middle;">' +
        '<div id="'+metric.id+'_name" style="position: relative;">'+
          metric.name +
          '<img style="position: absolute;right: 40px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/editstring" id="'+metric.id+'_edit">' +
          '<img style="position: absolute;right: 0px;" src="http://localhost:3000/theme/image.php/clean/core/1432795487/t/delete" id="'+metric.id+'_delete">' +
        '</div>' +
      '</td>' +
    '</tr>'
  );
  $('#'+metric.id+'_edit').click(function(){ self.update(metric); });
  $('#'+metric.id+'_delete').click(function(){ self.remove(metric); });
}

// Updates a metric by making a patch request
MetricList.prototype.update = function(metric) {
  var new_name = prompt("Enter the new name", metric.name);
  if (new_name !== null && new_name !== '' && new_name.length > 2 && new_name !== metric.name) {
    makeApi('PATCH','/design/versions/latest/metrics/'+metric.id, {
      type: 'point',
      name: new_name
    })
    .done(function() {
      $('#'+metric.id+'_name').text(new_name);
    });
  }
}

// Removes a metric by making a delete request and removes it from the list
MetricList.prototype.remove = function(metric) {
  var result = confirm("Do you really want to delete "+metric.name + '?');
  if(result) {
    makeApi('DELETE', '/design/versions/latest/metrics/'+metric.id)
    .done(function (data) {
      $('#'+metric.id+'_row').remove();
      alert("Metric "+metric.name+' was deleted Successfully');
    });
  }
}
