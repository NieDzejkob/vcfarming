function qError($el, msg){
	$el.qtip({
		content: msg,
		hide: {event: null},
		show: {ready: true},
		position: {
			my: 'center left',
			at: 'center right'}});
	$('*').qtip('show');
}

function recalculate(){
	console.log('recalculate');

	$('*').qtip('destroy', true);

	var lvl = $('#level').val();

	if(!/^[0-9]*$/.test(lvl)){
		qError($('#level'), '"' + lvl + '" is not a positive integer!');
		return;
	}

	lvl = parseInt(lvl);

	if(lvl < 2 || lvl > 100){
		qError($('#level'), 'Valid levels are between 2 and 100');
		return;
	}

	var otid = $('#otid').val();

	if(otid != '' && !/^[0-9]{5}$/.test(otid)){
		qError($('#otid'), 'Please enter 5 digits');
		return;
	}

	if(otid == ''){
		otid = null;
	}else{
		otid = parseInt(otid);

		if(otid > 65535){
			qError($('#otid'), 'The OT ID can\'t be larger than 65535');
			return;
		}
	}

	var DVs = {
		atk: $('#atk-dv').val(),
		def: $('#def-dv').val(),
		spd: $('#spd-dv').val(),
		spc: $('#spc-dv').val()};

	for(var dv in DVs){
		if(!/^[0-9]{1,2}$/.test(DVs[dv])){
			qError($('#' + dv + '-dv'), 'Please enter whole numbers from 0 to 15');
			return;
		}

		DVs[dv] = parseInt(DVs[dv]);

		if(DVs[dv] > 15){
			qError($('#' + dv + '-dv'), 'Please enter whole numbers from 0 to 15');
			return;
		}
	}

	var move = [
		$('#move1').val(),
		$('#move2').val(),
		$('#move3').val(),
		$('#move4').val()];

	if(move[0] == 0){
		qError($('#move1'), 'A Pok&eacute;mon can\'t have no first move');
		return;
	}

	if(move[1] == 0 && (move[2] != 0 || move[3] != 0)){
		qError($('#move2'), 'A Pok&eacute;mon can\'t have holes in its moveset');
		return;
	}

	if(move[2] == 0 && move[3] != 0){
		qError($('#move3'), 'A Pok&eacute;mon can\'t have holes in its moveset');
		return;
	}

	console.log('done');
}

function reseat(){
	$('*').qtip('reposition');
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

	var options = '<option value="0">-</option>';
	for(var i = 0;i < moves_az.length;i++){
		options += '<option value="' + (moves.indexOf(moves_az[i]) + 1) + '">' + moves_az[i] + '</option>';
	}

	$('.move').html(options);
	$('.move').change(recalculate);

	$('#shiny').change(function(){
		$('#advanced-mode input').val(this.checked ? 10 : 15);
		recalculate();
	});

	$('#advanced-mode input').change(function(){
		var atk = $('#atk-dv').val();
		var def = $('#def-dv').val();
		var spd = $('#spd-dv').val();
		var spc = $('#spc-dv').val();

		$('#shiny')[0].checked = (atk == 10 && ((def & 2) != 0) && spd == 10 && spc == 10);

		recalculate();
	});

	$('#adv').change(function(){
		if(this.checked){
			$('#advanced-mode').slideDown({complete: reseat});
			$('#shiny').prop('disabled', true);
		}else{
			$('#advanced-mode').slideUp({complete: reseat});
			$('#shiny').prop('disabled', false);
			$('#shiny').trigger('change');
		}
	}).trigger('change');

	recalculate();
});
