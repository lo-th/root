varying vec3 a;

void main()	{

	a = (modelMatrix*vec4(position,1)).xyz;
	gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);;

}