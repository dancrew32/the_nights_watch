(function(run) {
	var s = document.createElement('script');
	s.type= 'text/javascript';
	s.textContent = '('+ run.toString() +')()';
	(document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(s);
}(function() {

	var NightsWatch = function() {
		this.thresholds = {
			too_many_watches: 50,
			warned: []
		};
		this.stats = {
			total_watches: 0,
			watches_by_element: {},
		};
	};

	NightsWatch.prototype.getDom = function() {
		return $('.ng-scope');
	};

	NightsWatch.prototype.exceedsThreshold = function(key) {
		var exceeds = this.thresholds.warned.indexOf(key) === -1 
			&& this.stats.watches_by_element[key] >= this.thresholds.too_many_watches;
		if (exceeds)
			this.thresholds.warned.push(key);
		return exceeds;
	};

	NightsWatch.prototype.analyzeExpressions = function($watchers) {
		var expressions = [];
		angular.forEach($watchers, function(w) {
			if (typeof w.exp === 'function')
				return expressions.push([w.exp.toString(), 'see:', w.last]); // this could be minified :/
			return expressions.push(w.exp);
		});
		return expressions;
	};

	NightsWatch.prototype.scanEach = function() {
		var self = this;
		this.getDom().each(function(n, elem) {
			var $elem = $(elem);
			var $scope = $elem.scope();
			var $watchers = $scope.$$watchers;

			if (!$watchers)
				return true;

			var watchers_len = $watchers.length;
			self.stats.watches_by_element[elem.nodeName] = self.stats.watches_by_element[elem.nodeName] || 0;
			self.stats.total_watches += watchers_len;
			self.stats.watches_by_element[elem.nodeName] += watchers_len;

			if (!self.exceedsThreshold(elem.nodeName))	
				return true;
			
			console.log("Threshold Exceeded:", elem.nodeName, $scope, self.stats.watches_by_element[elem.nodeName]);
			console.log("Sample for this scope:", watchers_len, $watchers, $elem);
			console.log("Expressions for this scope's $watchers:", self.analyzeExpressions($watchers));
		});

		console.log('Total Watches:', this.stats.total_watches);
		console.log('Breakdown by nodeName:');
		for (var name in this.stats.watches_by_element)
			console.log(name, this.stats.watches_by_element[name]);
	};

	window.nwScan = function() {
		new NightsWatch().scanEach();
	};

	// initial check, call it from console whenever you want!
	window.nwScan();

}));
