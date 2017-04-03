import threejs from "three-js";
const THREE = threejs();

function getIntersectionMouse(event, mesh, camera)
{

    // On détecte la position de la souris
    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    vector.unproject(camera);
    // On balance le raycaster en fonction de la souris
    var raycaster = new THREE.Raycaster(camera.position,vector.sub(camera.position).normalize() );
    // On regarde les intersections entre le plan locate (invisible et au niveau des cubes) et le raycaster
    var intersect = raycaster.intersectObject( mesh );
    // console.log(intersect);

    if(intersect.length >= 1)
        return {
    		x: intersect[0].point.x,
    		y: intersect[0].point.y,
    		z: intersect[0].point.z
        };
}

module.exports = getIntersectionMouse;