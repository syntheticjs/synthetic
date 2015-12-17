define(function(m, o, r, u, l, u, s) {
	
    var mixin = function() {
        var mixinup = function(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
            return a;
        };
        return function(a) {
            var i = 1;
            for (;i < arguments.length; i++) {
                if ("object" === typeof arguments[i]) {
                    mixinup(a, arguments[i]);
                }
            }
            return a;
        };
    }();
    var inherit = function(mixin) {
        return function(aClass, classes) {
           if (!(classes instanceof Array)) classes = [classes];
			var cl=classes.length;
			
			var superconstructor = function(){
				 var args = Array.prototype.slice.apply(arguments);
	            /*
				Поскольку в процессе построения экземпляра будут выполняться функции конструкторы всех наследуемых
				классов, нам необходимо запоминать тех, которые уже были вызваны, во избежании повторного вызова.
				*/
				if ("object"!==typeof this.constructors) Object.defineProperty(this, 'constructors', {
	                configurable: false,
	                enumerable: false,
	                writable: false,
	                value: []
	            });
	               
				for (var i=0;i<cl;++i) {

					/*
					Мы должны помнить какие конструкторы уже были выполнены для этого объект.
					Поэтому всю историю конструкторов необходимо хранить в прототипе,
					во избежании повторного его вызова. Так как мы можем наследовать классы,
					которые происходят от одного предка. В это случае конструктор предка будет
					вызван несколько раз, чего не требуется.
					*/


					if (this.constructors.indexOf(classes[i])>=0) continue;
					this.constructors.push(classes[i]);

					classes[i].apply(this, args);
				}
			},
			superprototype = superconstructor.prototype = {};

			/*
			Первым делом мы должны позаботиться о том, что если у расширяемого класса уже есть __super__ прототип,
			он должен быть перенесен в новый superprototype.
			*/
			if (aClass.prototype&&aClass.prototype!==null&&aClass.prototype.__super__) mixin(superprototype, aClass.prototype.__super__);
			/*
			Мы должны миксировать данный суперпрототип с прототипами всех наследуемых классов,
			а так же с их суперпрототипами. Так как в их прототипе содержатся собственные методы класса,
			а в __super__ миксины тех классов, которые они, возможно наследовали.
			*/
			for (var i=0;i<cl;++i) {
				if (classes[i].prototype) {
					if (classes[i].prototype.__super__) superprototype = mixin(superprototype, classes[i].prototype.__super__);
					superprototype = mixin(superprototype, classes[i].prototype);
				}
			}

			/*
			Мы связывает суперпрототип с суперконструктором.
			*/
			superprototype.constructor = superconstructor;

			/*
			Польскольку мы не можем взять и подменить тело функции у существующей функции,
			нам придется подменить орегинальную функцию на собственную. 
			*/
			var Mixin = function() {

				/*
				Если в прототипе класса вдруг возникла переменная __disableContructor__, значит кто то 
				не хочет, что бы при создании экземпляра класса происходил вызов конструкторов.
				Это может применять в методе construct абстрактного прототипа Function, для вызова
				контруктора через функцию Apply.
				*/
				if (this.constructor && this.constructor.__disableContructor__) {
					this.constructor.__disableContructor__ = false;
					return false;
				}

				var args = Array.prototype.slice.apply(arguments);

				/*
				Мы выполняем расширенные функции только если мы являемся экземпляром Mixin
				*/			
				
				if (!(this===window)) {
					superconstructor.apply(this, args)
				}

				aClass.apply(this, args);
			}
			Mixin.prototype = Object.create(superprototype,{
				
				/*
				Для быстрого кроссбраузерного доступа к суперпроототипу будет использоваться свойство __super__
				*/
				__super__: {
					configurable: false,
					enumerable: false,
					writable: false,
					value: superprototype
				}
			});
			/*
			Все свойства и методы из старого прототипа мы переносим в новый. Нам необходимо сделать так,
			что бы новый класс ничем не отличался от старого, кроме нового суперпрототипа.
			*/
			if (aClass.prototype) mixin(Mixin.prototype, aClass.prototype);
			/*
			Кроме того, все статичные свойства так же должны быть скопированы
			*/
			for (var prop in aClass) {
				if (aClass.hasOwnProperty(prop)) Mixin[prop] = aClass[prop];
			}
			Object.defineProperty(Mixin.prototype, "constructor", {
				configurable: false,
				enumerable: false,
				writable: false,
				value: Mixin
			});
			/*
			Если браузер не поддерживает __proto__, то мы создадим его, хотя он будет
			являться нечто иным, чем оригинальный __proto__, так как __proto__.__proto__
			не вернет прототип прототипа. 
			*/
			if (!Mixin.prototype.__proto__) {
				Mixin.prototype.__proto__ = Mixin.prototype;
			}
            return Mixin;
        };
    }(mixin);
    Function.prototype.inherit = function() {
	    var classes = Array.prototype.slice.apply(arguments);
	    return inherit(this, classes);
	}

	Function.prototype.proto = function(proto) {
		if ("object"!==typeof this.prototype) this.prototype = {
			constructor: this
		};
		mixin(this.prototype, proto);
		return this;
	}

	Function.prototype.construct = function() {
		
		this.__disableContructor__ = true;
		
		var module = new this();
		var args = arguments[0] instanceof Array ? arguments[0] : [];
		
		this.apply(module, args);
		return module;
	}

});