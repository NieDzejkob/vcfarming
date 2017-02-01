function recalculate(){
	;
}

function textConvert(ch){
	var ret = charmap[ch];
	if(ret == undefined) ret = '<sup>E</sup><sub>D</sub>';
	if(!(/^[A-Za-z]$/.test(ret))) ret = '<span class="special">' + ret + '</span>';
	return ret;
}

$(function(){
	$('input[name=mon-id-sort]').change(function(){
		var id = $('#mon-id').val();
		var options = '';
		var sort = $('input[name=mon-id-sort]:checked').val();
		for(var i = 0;i < order[sort].length;i++){
			var monId = order.internal.indexOf(order[sort][i]) + 1;
			options += '<option value="' + monId + (id == monId ? '" selected>' : '">') + order[sort][i] + '</option>';
		}

		$('#mon-id').html(options);
	}).trigger('change');

	var screen = '';

	for(var i = 0;i < naming.upper.length;i++){
		for(var j = 0;j < naming.upper[i].length;j++){
			screen += '&nbsp;' + textConvert(naming.lower[i][j]);
		}

		if(i != naming.upper.length - 1) screen += ' <br />';
	}

	$('#naming').html(screen);

	$('#mon-id').change(recalculate);
	$('#level').change(recalculate);
	$('#nature').change(recalculate);
	$('#otid').change(recalculate);

	var options = '';
	for(var i = 0;i < moves.length;i++){
		options += '<option value="' + (i + 1) + '">' + moves[i] + '</option>';
	}

	$('.move').html(options);

	$('#shiny').change(function(){
		$('#advanced-mode input').val(this.checked ? 10 : 15);
	});

	$('#advanced-mode input').change(function(){
		var atk = $('#atk-dv').val();
		var def = $('#def-dv').val();
		var spd = $('#spd-dv').val();
		var spc = $('#spc-dv').val();

		$('#shiny')[0].checked = (atk == 10 && ((def & 2) != 0) && spd == 10 && spc == 10);
	});

	$('#adv').change(function(){
		if(this.checked){
			$('#advanced-mode').slideDown();
		}else{
			$('#advanced-mode').slideUp();
		}
	}).trigger('change');
});
