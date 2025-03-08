import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return new Response(JSON.stringify({ success: false, error: error || 'Unauthorized' }), {
        status: 401,
      });
    }

    const data = await request.json();
    await connectDB();

    const product = new Product({
      ...data,
      inStock: data.inStock ?? true
    });

    await product.save();
    return new Response(JSON.stringify({ success: true, product }), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to create product' }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return new Response(JSON.stringify({ success: false, error: error || 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify({ success: true, products }));
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to fetch products' }),
      { status: 500 }
    );
  }
}
