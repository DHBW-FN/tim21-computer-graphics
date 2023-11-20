export const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  #include <shadowmap_pars_vertex>
  
  uniform float uTime;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;

  float wave(float waveSize, float tipDistance, float centerDistance) {
    // Tip is the fifth vertex drawn per blade
    bool isTip = (gl_VertexID + 1) % 5 == 0;

    float waveDistance = isTip ? tipDistance : centerDistance;
    return sin((uTime / 500.0) + waveSize) * waveDistance;
  }

  void main() {
    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <project_vertex>
    #include <worldpos_vertex>
    #include <defaultnormal_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
  
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    if (vPosition.y < 0.0) {
      vPosition.y = 0.0;
    } else {
      vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);      
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  #include <common>
  #include <packing>
  #include <fog_pars_fragment>
  #include <bsdfs>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>
  #include <shadowmask_pars_fragment>
  #include <dithering_pars_fragment>
  
  uniform sampler2D uCloud;
  uniform float uLightIntensity;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;

  vec3 green = vec3(0.2, 0.6, 0.3);

  void main() {
    vec3 color = mix(green * 0.7, green, vPosition.y);
    color = mix(color, texture2D(uCloud, vUv).rgb, 0.1);

    float lighting = normalize(dot(vNormal, vec3(10)));
  
    vec3 shadowColor = vec3(0, 0, 0);
    float shadowPower = 0.5;

    color = mix(color, shadowColor, (1.0 - getShadowMask() ) * shadowPower);
    color = color * uLightIntensity;
    
    gl_FragColor = vec4(color, 1.0);
    #include <fog_fragment>
    #include <dithering_fragment>
  }
`;
