

#define M_PI 3.1415926535897932384626433832795
#define DIST 300.0
#define TIME_FACTOR .01

uniform float time;

attribute float size;

void main() {
	vec3 newPosition	= position;
	vec3 angle 			= vec3( 
		snoise( vec2( position.x, time * TIME_FACTOR ) ) * M_PI,
		snoise( vec2( position.y, time * TIME_FACTOR ) ) * M_PI,
		snoise( vec2( position.z, time * TIME_FACTOR ) ) * M_PI
	);

	mat3 rotX = mat3(	1,				0,					0,
						0,				cos(angle.x), 		-sin(angle.x),
						0,				sin(angle.x), 		cos(angle.x) );

	mat3 rotY = mat3(	cos(angle.y),		0,					sin(angle.y),
						0,					1, 					0,
						-sin(angle.y),		0,			 		cos(angle.y) );

	mat3 rotZ = mat3(	cos(angle.z),		sin(angle.z),		0,
						-sin(angle.z),		cos(angle.z),		0,
						0,					0,					1 );

	newPosition = newPosition * rotZ * rotX * rotY;

	// newPosition.x = snoise( vec2( position.x, time * .01) );
	// newPosition.y = snoise( vec2( position.y, time * .01) );
	// newPosition.z = snoise( vec2( position.z, time * .01) );

	newPosition = newPosition * DIST;

	// float angle1 = 2. * M_PI * fakePosition.x;
	// float angle2 = acos( fakePosition.y * 2. - 1. );

	// newPosition.x = DIST * sin( angle2 ) * cos( angle1 );
	// newPosition.y = DIST * sin( angle2 ) * sin( angle1 );
	// newPosition.z = DIST * cos( angle2 );



	vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1. );

	gl_PointSize = size * ( 500. / - mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
}