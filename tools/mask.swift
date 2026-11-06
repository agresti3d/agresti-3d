import Foundation
import Vision
import CoreImage
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else {
    FileHandle.standardError.write("uso: mask <entrada> <salida>\n".data(using: .utf8)!)
    exit(1)
}
let url = URL(fileURLWithPath: args[1])
guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    FileHandle.standardError.write("no se pudo leer \(args[1])\n".data(using: .utf8)!)
    exit(2)
}
let ci = CIImage(cgImage: cg)
let handler = VNImageRequestHandler(ciImage: ci, orientation: .up, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([req]) } catch {
    FileHandle.standardError.write("vision fallo\n".data(using: .utf8)!)
    exit(3)
}
guard let obs = req.results?.first else { exit(4) }
guard let pb = try? obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler) else { exit(5) }
let maskCI = CIImage(cvPixelBuffer: pb)
let ctx = CIContext()
guard let maskCG = ctx.createCGImage(maskCI, from: maskCI.extent) else { exit(6) }
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, maskCG, nil)
CGImageDestinationFinalize(dest)
print("ok \(maskCG.width)x\(maskCG.height)")
