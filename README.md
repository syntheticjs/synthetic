## Rude release

Synthetic.js is a library for implementing custom html elements, for now. In the future it is framework for creating rich web-applications based on ORM strategy. A project develops by both independently and as part of the project IDS x360. 

__Current version is not stable. The concept and technical features are still in the formative stages. To use it, you still need a deep knowledge of the library. So use it at your own risk until the release version.__

## Getting started
Installation of Syntehtic.js:
```terminal
bower install synthetic --save
```

Connecting to the page:
```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/synthetic/dist/sytnehtic.js"></script>
```

Creating the synthetic element:
```js
Synthetic.createComponent({
	name: 'hello-world',
	engine: 'angular'
}, function($component) {
	$component.template('<h1>Hello, world</h1>');
});
```

Usage:
```html
<body>
	<hello-world></hello-world>
</body>
```

### Dependencies
Angular 1.4


### License
MIT

### Author
Vladimir Kalmykov <vladimirmorulus@gmail.com>, 2015-2016