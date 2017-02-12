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

function pokehexIsAlphabet(c){
	return (c >= 0x80 && c <= 0x99) || (c >= 0xA0 && c <= 0xB9);
}

function pokehexIsUpper(c){
	return (c >= 0x80 && c <= 0x9F) || (c == 0x7F) || (c > 0xB9);
}

function pokehexIsLower(c){
	return (c == 0x7F) || (c >= 0x9A);
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
		parseInt($('#move1').val()),
		parseInt($('#move2').val()),
		parseInt($('#move3').val()),
		parseInt($('#move4').val())];

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

	if(move[1] != 0 && (move[1] == move[0])){
		qError($('#move2'), 'No duplicates can exist in the moveset');
		return;
	}

	if(move[2] != 0 && (move[2] == move[0] || move[2] == move[1])){
		qError($('#move3'), 'No duplicates can exist in the moveset');
		return;
	}

	if(move[3] != 0 && (move[3] == move[0] || move[3] == move[1] || move[3] == move[2])){
		qError($('#move4'), 'No duplicates can exist in the moveset');
		return;
	}

	var monID = parseInt($('#mon-id').val());

	data = [];

	data[0] = [];
	data[0][0] = monID;
	data[0][1] = move[0];
	data[0][2] = move[1];
	data[0][3] = move[2];
	data[0][4] = move[3];

	data[1] = [];
	data[1][0] = (DVs.atk << 4) | DVs.def;
	data[1][1] = (DVs.spd << 4) | DVs.spc;
	data[1][2] = lvl;
	if(otid === null){
		data[1][3] = null;
		data[1][4] = null;
	}else{
		data[1][3] = otid >> 8;
		data[1][4] = otid & 0xFF;
	}

	data[2] = [];
	data[2][0] = 0x80;
	data[2][1] = 0x84;
	data[2][2] = parseInt($('#nature').val());

	console.log(data);

	var nicks = [];

	for(var i = 0;i < 3;i++){
		var lastchar = 0x80;
		var nick = '';

		for(var j = 0;j < data[i].length;j++){
			if(data[i][j] === null){
				nick += textConvert(lastchar);
				nick += textConvert(lastchar);
				continue;
			}

			var minselects = 999;

			// determine the lowest possible amount of selects
			for(var cS in charmap){
				c = parseInt(cS);
				for(var dS in charmap){
					d = parseInt(dS);
					if(((c * 2 + d) & 0xFF) == data[i][j]){
						var selects = 0;
						if(pokehexIsUpper(lastchar) != pokehexIsUpper(c)){
							selects++;
						}

						if(pokehexIsUpper(c) != pokehexIsUpper(d)){
							selects++;
						}

						if(selects < minselects){
							minselects = selects;
						}
					}
				}
			}

			if(minselects == 999) return;

			var maxabet = -1;
			var combination = [];

			for(var cS in charmap){
				c = parseInt(cS);
				for(var dS in charmap){
					d = parseInt(dS);
					if(((c * 2 + d) & 0xFF) == data[i][j]){
						var selects = 0;
						if(pokehexIsUpper(lastchar) != pokehexIsUpper(c)){
							selects++;
						}

						if(pokehexIsUpper(c) != pokehexIsUpper(d)){
							selects++;
						}

						if(selects > minselects) continue;

						var abet = 0;
						if(pokehexIsAlphabet(c)) abet++;
						if(pokehexIsAlphabet(d)) abet++;
						
						if(abet > maxabet){
							maxabet = abet;
							combination = [c, d];
						}

						if(abet == 2) break;
					}
				}
			}

			if(maxabet == -1) return;

			nick += textConvert(combination[0]);
			nick += textConvert(combination[1]);
			lastchar = combination[1];
		}

		nicks[i] = nick;
	}

	$('#n1').html(nicks[0]);
	$('#n2').html(nicks[1]);
	$('#n3').html(nicks[2]);
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
			if(order[sort][i] == '...') continue;
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
