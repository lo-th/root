vec4 building_luma = emissiveMapTexelToLinear(vec4( mix( insideColor, vec4(0.0, 0.0, 0.0, 1.0), outsideColor.a ).xyz, 1.0));
totalEmissiveRadiance = building_luma.xyz*lightning*noiseColor.xyz;