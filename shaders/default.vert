void main(){
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    gl_Position = clipPosition;
}