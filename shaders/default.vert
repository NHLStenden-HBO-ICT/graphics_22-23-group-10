void main(){
    vec4 result = vec4(position, 1.0);

    vec4 modelPosition = modelMatrix * result;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    gl_Position = clipPosition;
}