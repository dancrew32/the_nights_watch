(function(run) {
	var s = document.createElement('script');
	s.type= 'text/javascript';
	s.textContent = '('+ run.toString() +')()';
	(document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(s);
}(function() {

	var NightsWatch = function() {
		var thresholds = {
			too_many_watches: 50,
			warned: []
		};
		var stats = {
			total_watches: 0,
			watches_by_element: {},
		};

		$('.ng-scope').each(function(n, elem) {
			var $elem = $(elem);
			var $scope = $elem.scope();
			var $watchers = $scope.$$watchers;

			if ($watchers) {
				var watchers_len = $watchers.length;
				stats.watches_by_element[elem.nodeName] = stats.watches_by_element[elem.nodeName] || 0;
				stats.total_watches += watchers_len;
				stats.watches_by_element[elem.nodeName] += watchers_len;

				//console.log(stats.watches_by_element[elem.nodeName]);

				if (thresholds.warned.indexOf(elem.nodeName) === -1 && stats.watches_by_element[elem.nodeName] >= thresholds.too_many_watches)  {
					thresholds.warned.push(elem.nodeName);
					var expressions = [];
					angular.forEach($watchers, function(w) {
						if (typeof w.exp === 'function')
							expressions.push([w.exp.toString(), 'see:', w.last]);
						else
							expressions.push(w.exp);
					});
					console.log('Threshold Exceeded:', elem.nodeName, $scope, stats.watches_by_element[elem.nodeName]);
					console.log('In this scope:', watchers_len, $watchers);
					console.log('Expressions:', expressions);
					console.log('This Sample $scope', $elem);
				}
			}  
		});

		console.log('Total Watches:', stats.total_watches);
		console.log('Breakdown by nodeName:');

		for (var name in stats.watches_by_element)
			console.log(name, stats.watches_by_element[name]);
	
	};

	new NightsWatch();

	setTimeout(function() {
		new NightsWatch();
	}, 10000);

}));
