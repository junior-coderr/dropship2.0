import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { verifyAuth, isAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const { user, error } = await verifyAuth(request);
    if (error || !user?.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const data = await request.json();
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { 
        ...data,
        // Ensure inStock is set when updating
        inStock: data.inStock ?? true
      },
      { new: true }
    );

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update product' }),
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch product' }),
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return new Response(JSON.stringify({ success: false, error: error || 'Unauthorized' }), {
        status: 401,
      });
    }

    const updates = await request.json();
    await connectDB();
    const id = await params.id;
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!product) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, product }));
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to update product' }),
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return new Response(JSON.stringify({ success: false, error: error || 'Unauthorized' }), {
        status: 401,
      });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return new Response(
        JSON.stringify({ success: false, error: 'Product not found' }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to delete product' }),
      { status: 500 }
    );
  }
}
