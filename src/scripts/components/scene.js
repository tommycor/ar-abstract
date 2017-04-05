import * as THREE from "three";

import config 				from '../utils/config';
import raf 					from '../utils/raf';
import mapper 				from '../utils/mapper';

module.exports = {

	init: function() {

		this.render  		= this.render.bind(this);
		this.onClick 		= this.onClick.bind(this);
		this.onResize  		= this.onResize.bind(this);
		this.onMove			= this.onMove.bind(this);
		this.clock   		= new THREE.Clock();
		this.cameraPos		= new THREE.Vector3( config.camera.position.x, config.camera.position.y, config.camera.position.z );
		this.currentCameraPos = new THREE.Vector3( this.cameraPos.x, this.cameraPos.y, this.cameraPos.z );

		this.plane   		= null;
		this.explosionsPos 	= [];
		this.explosionsTime = [];
		this.nbrParticles 	= 100000;

		// KEEP THIS SHIT
		// ADD VALUES IN A PREDEFINED LENGTH ARRAY
		// POP THE LASTS AND UNSHIFT THE NEW ONES

		//// RENDERER
		this.renderer = new THREE.WebGLRenderer({
			antialias	: true,
			alpha: true
		});
		this.renderer.setClearColor(config.canvas.color, 0);
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setSize( 640, 480 );

		//// INIT
		this.scene 	   = new THREE.Scene();
		this.container = config.canvas.element;

		// this.camera 		   = new THREE.PerspectiveCamera(45, this.ratio, 15, 3000);
		// this.camera.position.x = config.camera.position.x;
		// this.camera.position.y = config.camera.position.y;
		// this.camera.position.z = config.camera.position.z;
		// this.camera.lookAt(config.camera.target);

		this.camera 		   = new THREE.Camera();
		this.scene.add( this.camera );

		if ( config.axisHelper ) {
			this.axisHelper =  new THREE.AxisHelper( 5 );
			this.scene.add( this.axisHelper );
		}

		//// AMBIANT LIGHT
		this.ambient = new THREE.AmbientLight( config.lights.ambient.color );

		//// ADD OBJECTS TO SCENE
		this.scene.add( this.ambient );

		//// ADD CANVAS TO DOM
		this.container.appendChild( this.renderer.domElement );

		this.createAR();
		this.createParticles();

		//// REGIST RENDERER
		raf.register( this.render );
		raf.start();
		this.onResize();
		this.addControls();

		// window.addEventListener( 'click', this.onClick );
		window.addEventListener( 'resize', this.onResize );
		window.addEventListener( 'mousemove', this.onMove );
	},

	createAR: function() {
		this.onRenderFcts = new Array();
		var _this = this;

		this.arToolkitSource = new THREEx.ArToolkitSource({
			// to read from the webcam 
			sourceType : 'webcam',
			
			// to read from an image
			// sourceType : 'image',
			// sourceUrl : '../../data/images/img.jpg',		

			// to read from a video
			// sourceType : 'video',
			// sourceUrl : './assets/medias/headtracking.mp4',		
		});

		this.arToolkitSource.init( function onReady(){
			console.log('source is ready')

			// handle resize of renderer
			_this.arToolkitSource.onResize( _this.renderer.domElement );
		});


		this.arToolkitContext = new THREEx.ArToolkitContext( {
			cameraParametersUrl: './vendor/camera_para.dat',
			detectionMode: 'mono',
		} );

		// initialize it
		this.arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
			_this.camera.projectionMatrix.copy( _this.arToolkitContext.getProjectionMatrix() );
		});

		// update artoolkit on every frame
		this.onRenderFcts.push( function(){
			if( _this.arToolkitSource.ready === false )	return

			_this.arToolkitContext.update( _this.arToolkitSource.domElement )
		});


		this.markerRoot = new THREE.Group;
		this.scene.add( this.markerRoot );
		this.artoolkitMarker = new THREEx.ArMarkerControls(this.arToolkitContext, this.markerRoot, {
			type : 'pattern',
			// patternUrl : '../../data/data/patt.hiro',
			patternUrl : './vendor/patt.kanji',
		})
	},

	createParticles: function() {
		this.uniforms = {
			time: { type: 'f', value: 0.0 },
			map: { type: 't', value: THREE.ImageUtils.loadTexture(config.particles.texture) },

		}

		this.geometry 	= new THREE.BufferGeometry();
		this.vertices 	= new Float32Array( this.nbrParticles * 3 );
		this.sizes 		= new Float32Array( this.nbrParticles );

		for( let i = 0 ; i < this.nbrParticles ; i++ ) {
			this.vertices = this.randomizePoints(this.vertices, i);
			this.vertices = this.normalizePoints(this.vertices, i);

			this.sizes[ i ] = 1;
		}

		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );
		this.geometry.addAttribute( 'size', new THREE.BufferAttribute( this.sizes, 1 ) );

		this.material = new THREE.ShaderMaterial( {
			uniforms: this.uniforms,
			transparent: true,
			vertexShader: require('../shaders/noises/noise2D.glsl') + require('../shaders/particles.vertex.glsl'),
			fragmentShader: require('../shaders/particles.fragment.glsl')
		});

		this.particleSystem = new THREE.Points( this.geometry, this.material );

		this.markerRoot.add(this.particleSystem);
	},

	addControls: function() {
		this.buttons = document.querySelectorAll('.btn');

		if( this.buttons.length === 0 ) { return; }

		for( let i = 0 ; i < this.buttons.length ; i++ ) {
			let btn = this.buttons[i];
			
			btn.addEventListener('click', ()=>{

				for( let j = 0 ; j < this.buttons.length ; j++ ) {
					this.buttons[j].classList.remove('is-active');
				}

				btn.classList.add('is-active');
				this.nbrParticles = parseInt( btn.getAttribute('data-value') ) * 1000;
				this.scene.remove(this.particleSystem);
				this.createParticles();
			});
		}
	},

	randomizePoints: function( vertices, i ) {
		vertices[i * 3] 	= Math.random() * 2 - 1;
		vertices[i * 3 + 1] = Math.random() * 2 - 1;
		vertices[i * 3 + 2] = Math.random() * 2 - 1;

		if( vertices[i * 3] * vertices[i * 3] + vertices[i * 3 + 1] * vertices[i * 3 + 1] + vertices[i * 3 + 2] * vertices[i * 3 + 2] > 1 ) {
			vertices = this.randomizePoints( vertices, i );
		}

		 return vertices;
	},

	normalizePoints: function( vertices, i ) {
		let length = Math.sqrt( vertices[i * 3] * vertices[i * 3] + vertices[i * 3 + 1] * vertices[i * 3 + 1] + vertices[i * 3 + 2] * vertices[i * 3 + 2] );

		vertices[i * 3]		/= length;
		vertices[i * 3 + 1] /= length;
		vertices[i * 3 + 2] /= length;

		 return vertices;
	},

	onClick: function( event ) {
	},

	onMove: function( event ) {
		this.cameraPos.x = event.clientX - this.halfWidth;
		this.cameraPos.y = event.clientY - this.halfHeight;
	},

	onResize: function() {
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		// this.ratio = window.innerWidth / window.innerHeight;

		// this.camera.aspect = this.ratio;
		// this.camera.updateProjectionMatrix();

		// this.halfWidth = window.innerWidth * .5;
		// this.halfHeight = window.innerHeight * .5;

		this.arToolkitSource.onResize( this.renderer.domElement )
	},

	render: function() {
		let delta = this.clock.getDelta();

		this.currentCameraPos.x += ( ( this.cameraPos.x * .7) - this.currentCameraPos.x ) * 0.01;
		this.currentCameraPos.y += ( ( this.cameraPos.y * .8) - this.currentCameraPos.y ) * 0.01;

		// this.camera.position.set( this.currentCameraPos.x, this.currentCameraPos.y, this.currentCameraPos.z );
		// this.camera.lookAt(config.camera.target);

		this.uniforms.time.value += delta;

		this.onRenderFcts.forEach( (onRenderFct)=>{
			onRenderFct(delta/1000, this.uniforms.time.value/1000)
		} );

		this.renderer.render(this.scene, this.camera);
	}

};