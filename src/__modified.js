/**
 * Created by Florin on 3/11/2017.
 */

/*
 TiledImageLayer - cleanCache method
 Navigator - increase farDistance for atmosphere
 DrawContext - unitQuadBufferInterleaved
 BasicTextureProgram - localState
 SurfaceTileRendererProgram - localState, vertex bindings
 AbstractMesh - auto destroy vbo's
 TriangleMesh - auto destroy vbo's
 GeographicMesh - auto destroy vbo's
 Path - auto destroy vbo's
 Placemark - draw in soild color in picking mode
 Texture - disable anisotropic filtering
 WorldWindow - disable terrain pick, disable stencil buffer, disable reseting gl atributes in endFrame
 AtmosphereLayer, SkyProgram, GroundProgram - const instead of uniforms, disable low altitude rendering path, localState
 ColladaScene - flatten node tree, merge all meshes in one buffer, pre rotation, pre translations
 BMNGOneImageLayer - pass optional img src
 */

/*
* Skybox
*/