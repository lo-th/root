/*
"Glass and Gold Bubble" by Emmanuel Keller aka Tambako - June 2016
License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
Contact: tamby@tambako.ch
*/

#define pi 3.14159265359

// Switches, you can play with them!
#define bumped_glass
//#define thick_bottom
#define show_gold
#define specular
#define reflections

//#define antialias

struct Lamp
{
    vec3 position;
    vec3 color;
    float intensity;
    float attenuation;
};
    
struct TransMat
{
    vec3 col_vol;
    vec3 col_dif;
    vec3 col_fil;
    vec3 col_dev;
    float specint;
    float specshin;
    float ior;
};

struct RenderData
{
    vec3 col;
    vec3 pos;
    vec3 norm;
    int objnr;
};
   
// Every object of the scene has its ID
#define SKY_OBJ        0
#define BUBBLE_OBJ     1

Lamp lamps[2];

// Campera options
vec3 campos = vec3(0., -0., 10.);
vec3 camtarget = vec3(0., 0., 0.);
vec3 camdir = vec3(0., 0., 0.);
float fov = 6.;

// Ambient light
const vec3 ambientColor = vec3(0.3);
const float ambientint = 0.025;

// Gold options
const vec3 goldColor = vec3(1.1, 0.91, 0.52);
const vec3 goldColor2 = vec3(1.1, 1.07, 0.88);
const vec3 goldColor3 = vec3(1.02, 0.82, 0.55);
const float goldRef = 0.99;

// Tracing options
const float normdelta = 0.001;
const float maxdist = 40.;
const int nbref = 7;

// Glass perameters
const float bubbleRadius = 1.2;
const float bubbleThickness = 0.001;
const float bumpFactor = 0.014;

// Antialias. Change from 1 to 2 or more AT YOUR OWN RISK! It may CRASH your browser while compiling!
const float aawidth = 0.8;
const int aasamples = 2;

TransMat glassMat;

void init()
{
    lamps[0] = Lamp(vec3(-5., 3., -5.), vec3(1., 1., 1.), 1.5, 0.01);
    lamps[1] = Lamp(vec3(1.5, 4., 2.), vec3(0.7, 0.8, 1.), 1.7, 0.01);
    
    glassMat = TransMat(vec3(0.96, 0.99, 0.96),
                        vec3(0.01, 0.02, 0.02),
                        vec3(1.),
                        vec3(0.3, 0.5, 0.9),
                        0.4,
                        45.,
                        1.47);
}

// Union operation from iq
vec2 opU(vec2 d1, vec2 d2)
{
  return (d1.x<d2.x) ? d1 : d2;
}

vec2 rotateVec(vec2 vect, float angle)
{
    vec2 rv;
    rv.x = vect.x*cos(angle) - vect.y*sin(angle);
    rv.y = vect.x*sin(angle) + vect.y*cos(angle);
    return rv;
}

// 1D hash function
float hash(float n)
{
    return fract(sin(n)*753.5453123);
}

// From https://www.shadertoy.com/view/4sfGzS
float noise(vec3 x)
{
    //x.x = mod(x.x, 0.4);
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
  
    float n = p.x + p.y*157.0 + 113.0*p.z;
    return mix(mix(mix(hash(n+  0.0), hash(n+  1.0),f.x),
                   mix(hash(n+157.0), hash(n+158.0),f.x),f.y),
               mix(mix(hash(n+113.0), hash(n+114.0),f.x),
                   mix(hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

float bubblePattern(vec3 pos)
{
    return noise(normalize(pos)*2.5);
}

float goldValue(vec3 pos)
{
    #ifdef show_gold
    pos+= 0.04*noise(pos*26.7);
    return smoothstep(0.63, 0.64, bubblePattern(pos));
    #else
    return 0.;
    #endif
}

float bubbleBump(vec3 pos)
{
    #ifdef bumped_glass
    float wf = 65. + 15.*sin(iGlobalTime*0.08);
    float bp = bubblePattern(pos);
    float sa = smoothstep(0.1, 0.2, bp)*smoothstep(0.8, 0.65, bp);
    return sa*sin(bp*wf);
    #else
    return 0.;
    #endif
}

float map_bubble(vec3 pos)
{
   #ifdef thick_bottom
   float bubbleThickness2 = bubbleThickness*(1. + 500.*smoothstep(-0.25, -0.4, pos.y/bubbleRadius));
   #else
   float bubbleThickness2 = bubbleThickness;
   #endif
    
   float outside = length(pos) - bubbleRadius;
   outside-= bumpFactor*bubbleBump(pos);
   float inside = length(pos) - bubbleRadius + bubbleThickness2;
   inside-= bumpFactor*bubbleBump(pos);
   float df = max(outside, -inside);
    
   //df = max(df, pos.z);
   return df;
}

vec2 map(vec3 pos, bool inside)
{
    float bubble = map_bubble(pos);
    if (inside) bubble*=-1.;
    vec2 res = vec2(bubble, BUBBLE_OBJ);
    
    return res;
}

// Main tracing function
vec2 trace(vec3 cam, vec3 ray, float maxdist, bool inside) 
{
    float t = 0.1;
    float objnr = 0.;
    vec3 pos;
    float dist;
    float dist2;
    
    for (int i = 0; i < 128; ++i)
    {
      pos = ray*t + cam;
        vec2 res = map(pos, inside);
        dist = res.x;
        if (dist>maxdist || abs(dist)<0.002)
            break;
        t+= dist*0.43;
        objnr = abs(res.y);
    }
    return vec2(t, objnr);
}

// From https://www.shadertoy.com/view/MstGDM
// Here the texture maping is only used for the normal, not the raymarching, so it's a kind of bump mapping. Much faster
vec3 getNormal(vec3 pos, float e, bool inside)
{  
    vec2 q = vec2(0, e);
    return normalize(vec3(map(pos + q.yxx, inside).x - map(pos - q.yxx, inside).x,
                          map(pos + q.xyx, inside).x - map(pos - q.xyx, inside).x,
                          map(pos + q.xxy, inside).x - map(pos - q.xxy, inside).x));
}

// Gets the color of the sky
vec3 sky_color(vec3 ray)
{ 
    return textureCube(iChannel0, ray).rgb;
}

vec3 getGoldColor(vec3 pos)
{
    pos+= 0.4*noise(pos*24.);
    float t = noise(pos*30.);
    vec3 col = mix(goldColor, goldColor2, smoothstep(0.55, 0.95, t));
    col = mix(col, goldColor3, smoothstep(0.45, 0.25, t));
    return col;
}

vec3 getBubbleColor(vec3 pos)
{
  return mix(glassMat.col_dif, getGoldColor(pos), pow(goldValue(pos), 4.));
}
  
// Combines the colors
vec3 getColor(vec3 norm, vec3 pos, int objnr, vec3 ray)
{
   return objnr==BUBBLE_OBJ?getBubbleColor(pos):sky_color(ray);
}

// Fresnel reflectance factor through Schlick's approximation: https://en.wikipedia.org/wiki/Schlick's_approximation
float fresnel(vec3 ray, vec3 norm, float n2)
{
   float n1 = 1.; // air
   float angle = acos(-dot(ray, norm));
   float r0 = dot((n1-n2)/(n1+n2), (n1-n2)/(n1+n2));
   float r = r0 + (1. - r0)*pow(1. - cos(angle), 5.);
   return clamp(r, 0., 0.8);
}

// Shading of the objects pro lamp
vec3 lampShading(Lamp lamp, vec3 norm, vec3 pos, vec3 ocol, int objnr, int lampnr)
{   
    vec3 pl = normalize(lamp.position - pos);
    float dlp = distance(lamp.position, pos);
    vec3 pli = pl/pow(1. + lamp.attenuation*dlp, 2.);
    float dnp = dot(norm, pli);
      
    // Diffuse shading
    vec3 col;
    col = ocol*lamp.color*lamp.intensity*clamp(dnp, 0., 1.);
    
    // Specular shading
    #ifdef specular

    float specint = glassMat.specint;
    float specshin = glassMat.specshin;  
    //if (dot(norm, lamp.position - pos) > 0.0)
        col+= lamp.color*lamp.intensity*specint*pow(max(0.0, dot(reflect(pl, norm), normalize(pos - campos))), specshin);
    #endif
    
    // Softshadow
    #ifdef shadow
    col*= shi*softshadow(pos, normalize(lamp.position - pos), shf, 100.) + 1. - shi;
    #endif
    
    return col;
}

// Shading of the objects over all lamps
vec3 lampsShading(vec3 norm, vec3 pos, vec3 ocol, int objnr)
{
    vec3 col = vec3(0.);
    for (int l=0; l<2; l++) // lamps.length()
        col+= lampShading(lamps[l], norm, pos, ocol, objnr, l);
    
    return col;
}

// From https://www.shadertoy.com/view/lsSXzD, modified
vec3 GetCameraRayDir(vec2 vWindow, vec3 vCameraDir, float fov)
{
  vec3 vForward = normalize(vCameraDir);
  vec3 vRight = normalize(cross(vec3(0.0, 1.0, 0.0), vForward));
  vec3 vUp = normalize(cross(vForward, vRight));
    
  vec3 vDir = normalize(vWindow.x * vRight + vWindow.y * vUp + vForward * fov);

  return vDir;
}

// Sets the position of the camera with the mouse and calculates its direction
const float axm = 4.;
const float aym = 1.5;
void setCamera()
{
   vec2 iMouse2;
   if (iMouse.x==0. && iMouse.y==0.)
      iMouse2 = vec2(0.5, 0.5);
   else
      iMouse2 = iMouse.xy/iResolution.xy;
   
   campos = vec3(8.5, 0., 0.);
   campos.xy = rotateVec(campos.xy, -iMouse2.y*aym + aym*0.5);
   campos.yz = rotateVec(campos.yz, -iMouse2.y*aym + aym*0.5);
   campos.xz = rotateVec(campos.xz, -iMouse2.x*axm);

   camtarget = vec3(0.);
   camdir = camtarget - campos;   
}

// Tracing and rendering a ray
RenderData trace0(vec3 tpos, vec3 ray, float maxdist, bool inside)
{
    vec2 tr = trace(tpos, ray, maxdist, inside);
    float tx = tr.x;
    int objnr = int(tr.y);
    vec3 col;
    vec3 pos = tpos + tx*ray;
    vec3 norm;
    
    if (tx<maxdist*0.95)
    {
        norm = getNormal(pos, normdelta, inside);
        col = getColor(norm, pos, objnr, ray);
      
        // Shading
        col = ambientColor*ambientint + lampsShading(norm, pos, col, objnr);
    }
    else
    {
        objnr = SKY_OBJ;
        col = vec3(0.);
    }
    return RenderData(col, pos, norm, objnr);
}

vec3 getGlassAbsColor(float dist, vec3 color)
{
    return pow(color, vec3(0.1 + pow(dist*8., 2.)));
}

// Main render function with reflections and refractions
vec4 render(vec2 fragCoord)
{   
    vec2 uv = fragCoord.xy / iResolution.xy; 
    uv = uv*2.0 - 1.0;
    uv.x*= iResolution.x / iResolution.y;

    vec3 ray = GetCameraRayDir(uv, camdir, fov);
    RenderData traceinf = trace0(campos, ray, maxdist, false);
    vec3 col = traceinf.col;
    bool inside = false;
    float cior = glassMat.ior;
    vec3 glassf = vec3(1.);
    vec3 refray;

    glassf = vec3(1.);

    for (int i=0; i<nbref; i++)
    {
        if (traceinf.objnr==BUBBLE_OBJ)
        {  
            float gv = glassf.r*goldValue(traceinf.pos);
            #ifdef reflections
            refray = reflect(ray, traceinf.norm);
            float rf = fresnel(ray, traceinf.norm, glassMat.ior); 
            vec3 colGl = mix(col, sky_color(refray), rf*glassf);
            vec3 colGo = mix(col, getGoldColor(traceinf.pos)*sky_color(refray), goldRef);
          
            if (!inside)
            {
              col = mix(colGl, colGo, gv);
              glassf*= (1. - gv)*(1.- rf);
            }
            #endif
            
            cior = inside?1./glassMat.ior:glassMat.ior;

            vec3 ray_r = refract(ray, traceinf.norm, 1./cior);
            if (length(ray_r)!=0.)
                inside = !inside;
            else
                ray_r = reflect(ray, traceinf.norm);            

            vec3 pos = traceinf.pos;

            traceinf = trace0(pos, ray_r, 20., inside);
            if (inside)
                glassf*= getGlassAbsColor(distance(pos, traceinf.pos), glassMat.col_vol);
            glassf*= glassMat.col_fil;
            
            col+= clamp(traceinf.col*glassf, 0., 1.);

            ray = ray_r;

        }
        if (traceinf.objnr==SKY_OBJ)
        {
            col+= sky_color(ray)*glassf;
            break;
        }
    }
    return vec4(col, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{   
    init();
    setCamera();
    
    // Antialiasing.
    #ifdef antialias
    vec4 vs = vec4(0.);
    for (int j=0;j<aasamples ;j++)
    {
       float oy = float(j)*aawidth/max(float(aasamples-1), 1.);
       for (int i=0;i<aasamples ;i++)
       {
          float ox = float(i)*aawidth/max(float(aasamples-1), 1.);
          vs+= render(fragCoord + vec2(ox, oy));
       }
    }
    vec2 uv = fragCoord.xy / iResolution.xy;
    fragColor = vs/vec4(aasamples*aasamples);
    #else
    fragColor = render(fragCoord);
    #endif
}