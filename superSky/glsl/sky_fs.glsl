varying vec3 a;

uniform vec3 lightdir;
uniform float fog;
uniform float cloud_size;
uniform float cloud_covr;
uniform float cloud_dens;
uniform float t;

const float c=6.36e6;
const float d=6.38e6;
const int e=128;
const int f=8;
const float g=.76;
const float h=g*g;
const float i=8e3;
const float j=1200.;
const float k=15.;
const float l=3.141592653589793;

const vec3 vm = vec3(0,-c,0);
const vec3 vn = vec3(2.1e-5);
const vec3 vo = vec3(5.8e-6,1.35e-5,3.31e-5);

float X(float r){
	return fract(sin(r)*43758.5453);
}

float Y(in vec2 r){
	vec2 s,t;
	s=floor(r);
	t=fract(r);
	t=t*t*(3.-2.*t);
	float u,v;
	u=s.x+s.y*57.;
	v=mix(mix(X(u+0.),X(u+1.),t.x),mix(X(u+57.),X(u+58.),t.x),t.y);
	return v;
}

float X(in vec3 r){
	return fract(sin(dot(r,vec3(37.1,61.7,12.4)))*3758.5453123);
}

float Y(in vec3 r){
	vec3 s,t;
	s=floor(r);
	t=fract(r);
	t*=t*(3.-2.*t);
	return mix(mix(mix(X(s+vec3(0)),X(s+vec3(1,0,0)),t.x),mix(X(s+vec3(0,1,0)),X(s+vec3(1,1,0)),t.x),t.y),mix(mix(X(s+vec3(0,0,1)),X(s+vec3(1,0,1)),t.x),mix(X(s+vec3(0,1,1)),X(s+vec3(1)),t.x),t.y),t.z);
}

float Z(vec3 r){
	r.xz+=t;
	r*=.5;
	float s;
	s=.5*Y(r);
	r=r*2.52;
	s+=.25*Y(r);
	r=r*2.53;
	s+=.125*Y(r);
	r=r*2.51;
	s+=.0625*Y(r);
	r=r*2.53;
	s+=.03125*Y(r);
	r=r*2.52;
	s+=.015625*Y(r);
	return s;
}

float aa(vec3 r){
	float s,t;
	s=Z(r*2e-4*(1.-cloud_size));
	t=(1.-cloud_covr)/2.+.2;
	s=smoothstep(t,t+.2,s);
	s*=.5*cloud_dens;
	return s;
}

void ba(in vec3 r,out float s,out float t,out float u){
	float v,w;
	v=length(r-vm)-c;
	w=0.;
	if(5e3<v&&v<1e4)w=aa(r)*sin(l*(v-5e3)/5e3);
	s=exp(-v/i)+fog;t=exp(-v/j)+w+fog;
	u=w+fog;
}

float ca(in vec3 r,in vec3 s,in float t){
	vec3 u=r-vm;
	float v,w,x,y,z,A;
	v=dot(u,s);
	w=dot(u,u)-t*t;
	x=v*v-w;
	if(x<0.)return -1.;
	y=sqrt(x);
	z=-v-y;A=-v+y;
	return z>=0.?z:A;
}

vec3 da(in vec3 r,in vec3 s,out float t){
	
	float u,v,w,x,y,z,A,B,C,m,F;
	vec3 p = normalize(lightdir);
	u=ca(r,s,d);
	v=dot(s,p);
	w=1.+v*v;
	x=.0596831*w;
	y=.0253662*(1.-h)*w/((2.+h)*pow(abs(1.+h-2.*g*v),1.5));
	z=50.*pow(abs(1.+dot(s,-p)),2.)*dot(vec3(0,1,0),p)*(1.-cloud_covr)*(1.-min(fog,1.));
	A=0.;
	B=0.;
	C=0.;
	m=0.;
	vec3 D,E;
	D=vec3(0);
	E=vec3(0);
	F=u/float(e);
	for(int G=0;G<e;++G){
		float H,J,K,L,M;
		H=float(G)*F;
		vec3 I=r+s*H;
		L=0.;
		ba(I,J,K,L);
		J*=F;
		K*=F;
		A+=J;
		B+=K;
		C+=L;
		M=ca(I,p,d);
		if(M>0.){
			float N,O,P,Q;
			N=M/float(f);
			O=0.;
			P=0.;
			Q=0.;
			for(int R=0;R<f;++R){
				float S,U,V,W;S=float(R)*N;
				vec3 T=I+p*S;
				W=0.;
				ba(T,U,V,W);
				O+=U*N;
				P+=V*N;
				Q+=W*N;
			}
			vec3 S=exp(-(vo*(O+A)+vn*(P+B)));
			m+=L;
			D+=S*J;
			E+=S*K+z*m;
		}
		else return vec3(0);
	}
	t=m/80.;
	return k*(D*vo*x+E*vn*y);
}

void main(){

	vec3 p = normalize(lightdir);
	vec3 r,s,t;
	r=normalize(a);
	s=vec3(0,.99,0);
	float m,u,v,w,x,y;
	m=0.;
	t=clamp(da(s,r,m),vec3(0),vec3(10000));
	u=pow(abs(1.-abs(r.y)),10.);
	v=r.y>=0.?1.:u;
	w=r.y<=0.?1.:u;
	x=max(dot(vec3(0,1,0),p),0.)*.2;
	t=mix(vec3(x),t,v*.8);
	y=clamp(m+w,0.,.99)+.01;
	gl_FragColor = vec4(pow(abs(t),vec3(.5)),y);

}
